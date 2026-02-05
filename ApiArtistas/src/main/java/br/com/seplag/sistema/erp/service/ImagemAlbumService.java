package br.com.seplag.sistema.erp.service;

import br.com.seplag.sistema.erp.model.Album;
import br.com.seplag.sistema.erp.model.ImagemAlbum;
import br.com.seplag.sistema.erp.model.dto.ImagemAlbumComUrlDto;
import br.com.seplag.sistema.erp.model.dto.ImagemAlbumDto;
import br.com.seplag.sistema.erp.model.dto.NotificationDto;
import br.com.seplag.sistema.erp.repository.AlbumRepository;
import br.com.seplag.sistema.erp.repository.ImagemAlbumRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;
import br.com.seplag.sistema.storage.ArquivoInvalidoException;
import br.com.seplag.sistema.storage.MinioStorageService;
import br.com.seplag.sistema.websocket.NotificationPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class ImagemAlbumService {

    private static final long MAX_BYTES = 10L * 1024 * 1024;
    private static final int EXPIRACAO_URL_SEGUNDOS = 30 * 60;

    private final AlbumRepository albumRepository;
    private final ImagemAlbumRepository imagemAlbumRepository;
    private final MinioStorageService storage;
    private final NotificationPublisher notifications;

    public ImagemAlbumService(
            AlbumRepository albumRepository,
            ImagemAlbumRepository imagemAlbumRepository,
            MinioStorageService storage,
            NotificationPublisher notifications
    ) {
        this.albumRepository = albumRepository;
        this.imagemAlbumRepository = imagemAlbumRepository;
        this.storage = storage;
        this.notifications = notifications;
    }

    @Transactional(readOnly = true)
    public List<ImagemAlbumDto> listarPorAlbum(Long albumId) {
        if (!albumRepository.existsById(albumId)) {
            throw new RecursoNaoEncontradoException("Álbum não encontrado: " + albumId);
        }

        return imagemAlbumRepository.findByAlbumId(albumId).stream()
                .map(i -> new ImagemAlbumDto(
                        i.getId(),
                        i.getChaveObjeto(),
                        i.getTipoConteudo(),
                        i.getTamanhoBytes(),
                        i.isEhCapa()
                ))
                .toList();
    }

    @Transactional
    public ImagemAlbumDto adicionarAoAlbum(Long albumId, ImagemAlbumDto dto) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Álbum não encontrado: " + albumId));

        ImagemAlbum img = new ImagemAlbum();
        img.setAlbum(album);
        img.setChaveObjeto(dto.chaveObjeto());
        img.setTipoConteudo(dto.tipoConteudo());
        img.setTamanhoBytes(dto.tamanhoBytes());
        img.setEhCapa(Boolean.TRUE.equals(dto.ehCapa()));

        ImagemAlbum salvo = imagemAlbumRepository.save(img);

        NotificationDto payload = new NotificationDto(
                "ALBUM_IMAGE_ADDED",
                "ALBUM",
                albumId,
                album.getTitulo(),
                "Imagem adicionada ao álbum: " + album.getTitulo(),
                Instant.now(),
                Map.of(
                        "imageId", salvo.getId(),
                        "contentType", salvo.getTipoConteudo(),
                        "bytes", salvo.getTamanhoBytes(),
                        "ehCapa", salvo.isEhCapa()
                )
        );
        notifications.publish(payload);

        return new ImagemAlbumDto(
                salvo.getId(),
                salvo.getChaveObjeto(),
                salvo.getTipoConteudo(),
                salvo.getTamanhoBytes(),
                salvo.isEhCapa()
        );
    }

    @Transactional
    public List<ImagemAlbumDto> uploadMultiplasParaAlbum(Long albumId, List<MultipartFile> arquivos, Integer indiceCapa) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Álbum não encontrado: " + albumId));

        if (arquivos == null || arquivos.isEmpty()) {
            throw new ArquivoInvalidoException("Arquivos são obrigatórios");
        }

        boolean temCapa = (indiceCapa != null);
        if (temCapa && (indiceCapa < 0 || indiceCapa >= arquivos.size())) {
            throw new ArquivoInvalidoException("indiceCapa inválido. Use 0 até " + (arquivos.size() - 1));
        }

        if (temCapa) {
            imagemAlbumRepository.desmarcarCapasDoAlbum(albumId);
        }

        List<String> objectKeysEnviados = new java.util.ArrayList<>();
        List<ImagemAlbumDto> result = new java.util.ArrayList<>();

        try {
            for (int i = 0; i < arquivos.size(); i++) {
                MultipartFile arquivo = arquivos.get(i);
                validarArquivo(arquivo);

                String contentType = arquivo.getContentType();
                String objectKey = storage.gerarObjectKeyAlbum(albumId, contentType);

                // 1) MinIO
                storage.upload(objectKey, arquivo.getInputStream(), arquivo.getSize(), contentType);
                objectKeysEnviados.add(objectKey);

                ImagemAlbum img = new ImagemAlbum();
                img.setAlbum(album);
                img.setChaveObjeto(objectKey);
                img.setTipoConteudo(contentType);
                img.setTamanhoBytes(arquivo.getSize());

                boolean ehCapa = temCapa && (i == indiceCapa);
                img.setEhCapa(ehCapa);

                ImagemAlbum salvo = imagemAlbumRepository.save(img);

                result.add(new ImagemAlbumDto(
                        salvo.getId(),
                        salvo.getChaveObjeto(),
                        salvo.getTipoConteudo(),
                        salvo.getTamanhoBytes(),
                        salvo.isEhCapa()
                ));
            }

            // Notificação (imagem upload)
            notifications.publish(new NotificationDto(
                    "ALBUM_IMAGES_UPLOADED",
                    "ALBUM",
                    albumId,
                    album.getTitulo(),
                    "Imagens enviadas para o álbum: " + album.getTitulo(),
                    Instant.now(),
                    Map.of(
                            "qtd", result.size(),
                            "temCapa", result.stream().anyMatch(i -> Boolean.TRUE.equals(i.ehCapa()))
                    )
            ));

            return result;
        } catch (Exception e) {
            for (String key : objectKeysEnviados) {
                try { storage.delete(key); } catch (Exception ignored) {}
            }

            //  Notificação (upload falhou)
            notifications.publish(new NotificationDto(
                    "ALBUM_UPLOAD_FAILED",
                    "ALBUM",
                    albumId,
                    album.getTitulo(),
                    "Falha ao enviar imagens do álbum: " + album.getTitulo(),
                    Instant.now(),
                    Map.of("error", e.getMessage() == null ? "erro" : e.getMessage())
            ));

            throw new RuntimeException("Falha ao enviar imagens para o MinIO", e);
        }
    }

    @Transactional
    public ImagemAlbumDto definirCapa(Long albumId, Long imagemId) {
        ImagemAlbum img = imagemAlbumRepository.findByIdAndAlbumId(imagemId, albumId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Imagem não encontrada: " + imagemId));

        imagemAlbumRepository.desmarcarCapasDoAlbum(albumId);

        img.setEhCapa(true);
        ImagemAlbum salvo = imagemAlbumRepository.save(img);

        //  Notificação troca de capa
        notifications.publish(new NotificationDto(
                "ALBUM_COVER_CHANGED",
                "ALBUM",
                albumId,
                img.getAlbum() != null ? img.getAlbum().getTitulo() : null,
                "Capa do álbum atualizada",
                Instant.now(),
                Map.of(
                        "imageId", salvo.getId(),
                        "objectKey", salvo.getChaveObjeto()
                )
        ));

        return new ImagemAlbumDto(
                salvo.getId(),
                salvo.getChaveObjeto(),
                salvo.getTipoConteudo(),
                salvo.getTamanhoBytes(),
                salvo.isEhCapa()
        );
    }

    @Transactional(readOnly = true)
    public String gerarUrlAssinada(Long albumId, Long imagemId) {
        ImagemAlbum img = imagemAlbumRepository.findByIdAndAlbumId(imagemId, albumId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Imagem não encontrada: " + imagemId));

        try {
            return storage.presignedGetUrl(img.getChaveObjeto(), EXPIRACAO_URL_SEGUNDOS);
        } catch (Exception e) {
            throw new RuntimeException("Falha ao gerar URL assinada", e);
        }
    }

    @Transactional
    public void deletarImagem(Long albumId, Long imagemId) {
        ImagemAlbum img = imagemAlbumRepository.findByIdAndAlbumId(imagemId, albumId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Imagem não encontrada: " + imagemId));

        String tituloAlbum = img.getAlbum() != null ? img.getAlbum().getTitulo() : null;
        String chave = img.getChaveObjeto();

        // 1) tenta apagar do MinIO primeiro
        try {
            storage.delete(chave);
        } catch (Exception e) {
            throw new RuntimeException("Falha ao remover objeto do MinIO", e);
        }

        // 2) apaga do banco
        imagemAlbumRepository.delete(img);

        // Notificação (imagem deletado)
        notifications.publish(new NotificationDto(
                "ALBUM_IMAGE_DELETED",
                "ALBUM",
                albumId,
                tituloAlbum,
                "Imagem removida do álbum" + (tituloAlbum != null ? ": " + tituloAlbum : ""),
                Instant.now(),
                Map.of(
                        "imageId", imagemId,
                        "objectKey", chave
                )
        ));
    }

    @Transactional(readOnly = true)
    public List<ImagemAlbumComUrlDto> listarPorAlbumComUrl(Long albumId) {
        if (!albumRepository.existsById(albumId)) {
            throw new RecursoNaoEncontradoException("Álbum não encontrado: " + albumId);
        }

        List<ImagemAlbumDto> imagens = listarPorAlbum(albumId);

        return imagens.stream().map(img -> {
            String url;
            try {
                url = storage.presignedGetUrl(img.chaveObjeto(), EXPIRACAO_URL_SEGUNDOS);
            } catch (Exception e) {
                throw new RuntimeException("Falha ao gerar URL assinada para imagem " + img.id(), e);
            }

            return new ImagemAlbumComUrlDto(
                    img.id(),
                    img.chaveObjeto(),
                    img.tipoConteudo(),
                    img.tamanhoBytes(),
                    img.ehCapa(),
                    url
            );
        }).toList();
    }

    @Transactional
    public List<ImagemAlbumDto> uploadMultiplasParaAlbumOpcional(Long albumId, List<MultipartFile> arquivos, Integer indiceCapa) {
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Álbum não encontrado: " + albumId));

        if (arquivos == null || arquivos.isEmpty()) {
            return List.of();
        }

        Integer capaIdx = normalizeIndiceCapa(indiceCapa, arquivos.size());

        imagemAlbumRepository.desmarcarCapasDoAlbum(albumId);

        List<String> objectKeysEnviados = new java.util.ArrayList<>();
        List<ImagemAlbumDto> result = new java.util.ArrayList<>();

        try {
            for (int i = 0; i < arquivos.size(); i++) {
                MultipartFile arquivo = arquivos.get(i);
                validarArquivo(arquivo);

                String contentType = arquivo.getContentType();
                String objectKey = storage.gerarObjectKeyAlbum(albumId, contentType);

                storage.upload(objectKey, arquivo.getInputStream(), arquivo.getSize(), contentType);
                objectKeysEnviados.add(objectKey);

                ImagemAlbum img = new ImagemAlbum();
                img.setAlbum(album);
                img.setChaveObjeto(objectKey);
                img.setTipoConteudo(contentType);
                img.setTamanhoBytes(arquivo.getSize());
                img.setEhCapa(i == capaIdx);

                ImagemAlbum salvo = imagemAlbumRepository.save(img);

                result.add(new ImagemAlbumDto(
                        salvo.getId(),
                        salvo.getChaveObjeto(),
                        salvo.getTipoConteudo(),
                        salvo.getTamanhoBytes(),
                        salvo.isEhCapa()
                ));
            }

            // Notificação (imagens upload)
            notifications.publish(new NotificationDto(
                    "ALBUM_IMAGES_UPLOADED",
                    "ALBUM",
                    albumId,
                    album.getTitulo(),
                    "Imagens enviadas para o álbum: " + album.getTitulo(),
                    Instant.now(),
                    Map.of(
                            "qtd", result.size(),
                            "temCapa", result.stream().anyMatch(i -> Boolean.TRUE.equals(i.ehCapa()))
                    )
            ));

            return result;
        } catch (Exception e) {
            for (String key : objectKeysEnviados) {
                try { storage.delete(key); } catch (Exception ignored) {}
            }
            // Notificação (imagens falhou)
            notifications.publish(new NotificationDto(
                    "ALBUM_UPLOAD_FAILED",
                    "ALBUM",
                    albumId,
                    album.getTitulo(),
                    "Falha ao enviar imagens do álbum: " + album.getTitulo(),
                    Instant.now(),
                    Map.of("error", e.getMessage() == null ? "erro" : e.getMessage())
            ));

            throw new RuntimeException("Falha ao enviar imagens para o MinIO", e);
        }
    }

    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ArquivoInvalidoException("Arquivo é obrigatório");
        }
        if (arquivo.getSize() > MAX_BYTES) {
            throw new ArquivoInvalidoException("Arquivo excede o limite de 10MB");
        }
        String ct = arquivo.getContentType();
        if (ct == null || !(ct.equalsIgnoreCase("image/jpeg")
                || ct.equalsIgnoreCase("image/png")
                || ct.equalsIgnoreCase("image/webp"))) {
            throw new ArquivoInvalidoException("Tipo de arquivo inválido. Use JPEG, PNG ou WEBP");
        }
    }

    private Integer normalizeIndiceCapa(Integer indiceCapa, int total) {
        if (total <= 0) return 0;
        if (indiceCapa == null) return 0;
        if (indiceCapa < 0 || indiceCapa >= total) return 0;
        return indiceCapa;
    }
}
