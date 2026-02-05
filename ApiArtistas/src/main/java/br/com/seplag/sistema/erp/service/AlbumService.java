package br.com.seplag.sistema.erp.service;

import br.com.seplag.sistema.erp.model.Album;
import br.com.seplag.sistema.erp.model.Artista;
import br.com.seplag.sistema.erp.model.dto.AlbumComImagensDto;
import br.com.seplag.sistema.erp.model.dto.AlbumDto;
import br.com.seplag.sistema.erp.model.dto.ImagemAlbumDto;
import br.com.seplag.sistema.erp.model.dto.NotificationDto;
import br.com.seplag.sistema.erp.repository.AlbumRepository;
import br.com.seplag.sistema.erp.repository.ArtistaRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;
import br.com.seplag.sistema.websocket.NotificationPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final ArtistaRepository artistaRepository;
    private final ImagemAlbumService imagemAlbumService;
    private final NotificationPublisher notifications;

    public AlbumService(
            AlbumRepository albumRepository,
            ArtistaRepository artistaRepository,
            ImagemAlbumService imagemAlbumService,
            NotificationPublisher notifications
    ) {
        this.albumRepository = albumRepository;
        this.artistaRepository = artistaRepository;
        this.imagemAlbumService = imagemAlbumService;
        this.notifications = notifications;
    }

    @Transactional
    public AlbumDto criar(AlbumDto dto) {
        Album album = new Album();
        album.setTitulo(dto.titulo());
        album.setDataLancamento(dto.dataLancamento());

        List<Artista> artistas = carregarArtistas(dto.artistasIds());
        album.setArtistas(artistas);

        Album salvo = albumRepository.save(album);

        // Notificação (album criado)
        List<Long> artistasIds = (salvo.getArtistas() == null)
                ? List.of()
                : salvo.getArtistas().stream().map(Artista::getId).toList();

        notifications.publish(new NotificationDto(
                "ALBUM_CREATED",
                "ALBUM",
                salvo.getId(),
                salvo.getTitulo(),
                "Novo álbum cadastrado: " + salvo.getTitulo(),
                Instant.now(),
                Map.of("artistasIds", artistasIds)
        ));

        return toDto(salvo);
    }

    @Transactional
    public AlbumComImagensDto criarComUpload(AlbumDto dto, List<MultipartFile> arquivos, Integer indiceCapa) {
        AlbumDto albumCriado = criar(dto);

        try {
            List<ImagemAlbumDto> imagens = imagemAlbumService.uploadMultiplasParaAlbumOpcional(
                    albumCriado.id(),
                    arquivos,
                    indiceCapa
            );

            // notificar adicionar imagens
            if (arquivos != null && !arquivos.isEmpty()) {
                notifications.publish(new NotificationDto(
                        "ALBUM_IMAGES_UPLOADED",
                        "ALBUM",
                        albumCriado.id(),
                        albumCriado.titulo(),
                        "Imagens enviadas para o álbum: " + albumCriado.titulo(),
                        Instant.now(),
                        Map.of(
                                "qtd", imagens.size(),
                                "temCapa", imagens.stream().anyMatch(i -> Boolean.TRUE.equals(i.ehCapa()))
                        )
                ));
            }

            return new AlbumComImagensDto(albumCriado, imagens, true, null);
        } catch (RuntimeException ex) {
            String msg = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();

            // Notificação falha de upload (álbum foi criado, mas imagens falharam)
            if (arquivos != null && !arquivos.isEmpty()) {
                notifications.publish(new NotificationDto(
                        "ALBUM_UPLOAD_FAILED",
                        "ALBUM",
                        albumCriado.id(),
                        albumCriado.titulo(),
                        "Falha ao enviar imagens do álbum: " + albumCriado.titulo(),
                        Instant.now(),
                        Map.of("error", msg)
                ));
            }

            return new AlbumComImagensDto(albumCriado, List.of(), false, msg);
        }
    }

    @Transactional(readOnly = true)
    public Page<AlbumDto> listar(List<Long> artistaIds, String titulo, Pageable pageable) {
        if (artistaIds != null && artistaIds.isEmpty()) {
            artistaIds = null;
        }
        return albumRepository.buscarComFiltro(artistaIds, titulo, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public AlbumDto buscarPorId(Long id) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Álbum não encontrado: " + id));
        return toDto(album);
    }

    @Transactional
    public AlbumDto atualizar(Long id, AlbumDto dto) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Álbum não encontrado: " + id));

        album.setTitulo(dto.titulo());
        album.setDataLancamento(dto.dataLancamento());

        List<Artista> artistas = carregarArtistas(dto.artistasIds());
        album.setArtistas(artistas);

        Album salvo = albumRepository.save(album);

        List<Long> artistasIds = (salvo.getArtistas() == null)
                ? List.of()
                : salvo.getArtistas().stream().map(Artista::getId).toList();

        notifications.publish(new NotificationDto(
                "ALBUM_UPDATED",
                "ALBUM",
                salvo.getId(),
                salvo.getTitulo(),
                "Álbum atualizado: " + salvo.getTitulo(),
                Instant.now(),
                Map.of("artistasIds", artistasIds)
        ));

        return toDto(salvo);
    }

    @Transactional
    public void deletar(Long id) {
        if (!albumRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Álbum não encontrado: " + id);
        }

        albumRepository.deleteById(id);

        notifications.publish(new NotificationDto(
                "ALBUM_DELETED",
                "ALBUM",
                id,
                null,
                "Álbum removido: " + id,
                Instant.now(),
                Map.of()
        ));
    }

    private AlbumDto toDto(Album album) {
        List<Long> artistasIds = (album.getArtistas() == null)
                ? List.of()
                : album.getArtistas().stream().map(Artista::getId).toList();

        return new AlbumDto(
                album.getId(),
                album.getTitulo(),
                album.getDataLancamento(),
                artistasIds
        );
    }

    private List<Artista> carregarArtistas(List<Long> artistasIds) {
        if (artistasIds == null || artistasIds.isEmpty()) {
            return List.of();
        }

        List<Artista> artistas = artistaRepository.findAllById(artistasIds);

        if (artistas.size() != artistasIds.size()) {
            throw new RecursoNaoEncontradoException("Um ou mais artistas informados não existem");
        }

        return artistas;
    }
}
