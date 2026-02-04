package br.com.seplag.sistema.erp.service;

import br.com.seplag.sistema.erp.model.Album;
import br.com.seplag.sistema.erp.model.Artista;
import br.com.seplag.sistema.erp.model.dto.AlbumComImagensDto;
import br.com.seplag.sistema.erp.model.dto.AlbumDto;
import br.com.seplag.sistema.erp.model.dto.ImagemAlbumDto;
import br.com.seplag.sistema.erp.repository.AlbumRepository;
import br.com.seplag.sistema.erp.repository.ArtistaRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final ArtistaRepository artistaRepository;
    private final ImagemAlbumService imagemAlbumService;

    public AlbumService(
            AlbumRepository albumRepository,
            ArtistaRepository artistaRepository,
            ImagemAlbumService imagemAlbumService
    ) {
        this.albumRepository = albumRepository;
        this.artistaRepository = artistaRepository;
        this.imagemAlbumService = imagemAlbumService;
    }

    @Transactional
    public AlbumDto criar(AlbumDto dto) {
        Album album = new Album();
        album.setTitulo(dto.titulo());
        album.setDataLancamento(dto.dataLancamento());

        List<Artista> artistas = carregarArtistas(dto.artistasIds());
        album.setArtistas(artistas);

        Album salvo = albumRepository.save(album);
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
            return new AlbumComImagensDto(albumCriado, imagens, true, null);
        } catch (RuntimeException ex) {
            String msg = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
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
        return toDto(salvo);
    }

    @Transactional
    public void deletar(Long id) {
        if (!albumRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Álbum não encontrado: " + id);
        }
        albumRepository.deleteById(id);
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