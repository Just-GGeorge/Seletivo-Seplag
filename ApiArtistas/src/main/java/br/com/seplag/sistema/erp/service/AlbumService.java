package br.com.seplag.sistema.erp.service;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.com.seplag.sistema.erp.model.Album;
import br.com.seplag.sistema.erp.model.Artista;
import br.com.seplag.sistema.erp.model.dto.AlbumDto;
import br.com.seplag.sistema.erp.repository.AlbumRepository;
import br.com.seplag.sistema.erp.repository.ArtistaRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;

import java.time.LocalDate;
import java.util.List;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final ArtistaRepository artistaRepository;

    public AlbumService(AlbumRepository albumRepository, ArtistaRepository artistaRepository) {
        this.albumRepository = albumRepository;
        this.artistaRepository = artistaRepository;
    }

    @Transactional
    public AlbumDto criar(AlbumDto dto) {
        Artista artista = artistaRepository.findById(dto.artistaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Artista não encontrado: " + dto.artistaId()));

        Album a = new Album();
        a.setArtista(artista);
        a.setTitulo(dto.titulo());
        a.setDataLancamento(dto.dataLancamento());

        Album salvo = albumRepository.save(a);
        return new AlbumDto(salvo.getId(), salvo.getArtista().getId(), salvo.getTitulo(), salvo.getDataLancamento());
    }

    @Transactional(readOnly = true)
    public AlbumDto buscarPorId(Long id) {
        Album a = albumRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Álbum não encontrado: " + id));
        return new AlbumDto(a.getId(), a.getArtista().getId(), a.getTitulo(), a.getDataLancamento());
    }

    @Transactional(readOnly = true)
    public Page<AlbumDto> listarPorArtista(Long artistaId, String titulo, Pageable pageable) {
        return albumRepository.buscarComFiltro(artistaId, titulo, pageable)
                .map(a -> new AlbumDto(a.getId(), a.getArtista().getId(), a.getTitulo(), a.getDataLancamento()));
    }

    @Transactional
    public AlbumDto atualizar(Long id, AlbumDto dto) {
        Album a = albumRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Álbum não encontrado: " + id));

        if (!a.getArtista().getId().equals(dto.artistaId())) {
            Artista novoArtista = artistaRepository.findById(dto.artistaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Artista não encontrado: " + dto.artistaId()));
            a.setArtista(novoArtista);
        }

        a.setTitulo(dto.titulo());
        a.setDataLancamento(dto.dataLancamento());

        Album salvo = albumRepository.save(a);
        return new AlbumDto(salvo.getId(), salvo.getArtista().getId(), salvo.getTitulo(), salvo.getDataLancamento());
    }

    @Transactional
    public void deletar(Long id) {
        if (!albumRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Álbum não encontrado: " + id);
        }
        albumRepository.deleteById(id);
    }
}