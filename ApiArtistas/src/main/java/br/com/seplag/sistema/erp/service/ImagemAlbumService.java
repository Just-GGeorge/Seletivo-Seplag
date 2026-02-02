package br.com.seplag.sistema.erp.service;


import br.com.seplag.sistema.erp.model.dto.ImagemAlbumComUrlDto;
import br.com.seplag.sistema.storage.ArquivoInvalidoException;
import br.com.seplag.sistema.storage.MinioStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.seplag.sistema.erp.model.Album;
import br.com.seplag.sistema.erp.model.ImagemAlbum;
import br.com.seplag.sistema.erp.model.dto.ImagemAlbumDto;
import br.com.seplag.sistema.erp.repository.AlbumRepository;
import br.com.seplag.sistema.erp.repository.ImagemAlbumRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;

import java.util.List;

@Service
public class ImagemAlbumService {

    private static final long MAX_BYTES = 10L * 1024 * 1024;
    private static final int EXPIRACAO_URL_SEGUNDOS = 30 * 60;


    private final AlbumRepository albumRepository;
    private final ImagemAlbumRepository imagemAlbumRepository;
    private final MinioStorageService storage;


    public ImagemAlbumService(AlbumRepository albumRepository,
                              ImagemAlbumRepository imagemAlbumRepository,
                              MinioStorageService storage) {
        this.albumRepository = albumRepository;
        this.imagemAlbumRepository = imagemAlbumRepository;
        this.storage = storage;
    }

    @Transactional(readOnly = true)
    public List<ImagemAlbumDto> listarPorAlbum(Long albumId) {
        // garante 404 se álbum não existir
        if (!albumRepository.existsById(albumId)) {
            throw new br.com.seplag.sistema.exception.RecursoNaoEncontradoException("Álbum não encontrado: " + albumId);
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

            return result;
        } catch (Exception e) {
            for (String key : objectKeysEnviados) {
                try { storage.delete(key); } catch (Exception ignored) {}
            }
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
            return storage.presignedGetUrl(img.getChaveObjeto(), EXPIRACAO_URL_SEGUNDOS );
        } catch (Exception e) {
            throw new RuntimeException("Falha ao gerar URL assinada", e);
        }
    }

    @Transactional
    public void deletarImagem(Long albumId, Long imagemId) {
        ImagemAlbum img = imagemAlbumRepository.findByIdAndAlbumId(imagemId, albumId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Imagem não encontrada: " + imagemId));

        // 1) tenta apagar do MinIO primeiro
        try {
            storage.delete(img.getChaveObjeto());
        } catch (Exception e) {
            throw new RuntimeException("Falha ao remover objeto do MinIO", e);
        }

        // 2) apaga do banco
        imagemAlbumRepository.delete(img);
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

    @Transactional(readOnly = true)
    public List<ImagemAlbumComUrlDto> listarPorAlbumComUrl(Long albumId) {
        if (!albumRepository.existsById(albumId)) {
            throw new RecursoNaoEncontradoException("Álbum não encontrado: " + albumId);
        }

        List<ImagemAlbumDto> imagens = listarPorAlbum(albumId);

        return imagens.stream().map(img -> {
            String url;
            try {
                url = storage.presignedGetUrl(img.chaveObjeto(), EXPIRACAO_URL_SEGUNDOS );
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
}
