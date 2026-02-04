package br.com.seplag.sistema.erp.service;

import br.com.seplag.sistema.erp.model.dto.ArtistaListDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.com.seplag.sistema.erp.model.Artista;
import br.com.seplag.sistema.erp.model.dto.ArtistaDto;
import br.com.seplag.sistema.erp.repository.ArtistaRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;

import java.util.List;

@Service
public class ArtistaService {

    private final ArtistaRepository artistaRepository;

    public ArtistaService(ArtistaRepository artistaRepository) {
        this.artistaRepository = artistaRepository;
    }

    @Transactional
    public ArtistaDto criar(ArtistaDto dto) {
        Artista a = new Artista();
        a.setNome(dto.nome());
        a.setGenero(dto.genero());

        Artista salvo = artistaRepository.save(a);
        return new ArtistaDto(salvo.getId(), salvo.getNome(), salvo.getGenero());
    }

    @Transactional(readOnly = true)
    public Page<ArtistaListDto> listar(String pesquisa, Pageable pageable) {
        String sortField = "id";
        String sortDir = "asc";

        if (pageable.getSort().isSorted()) {
            var order = pageable.getSort().iterator().next();
            sortField = order.getProperty();
            sortDir = order.isAscending() ? "asc" : "desc";
        }

        Pageable semSort = Pageable.ofSize(pageable.getPageSize()).withPage(pageable.getPageNumber());

        return artistaRepository.buscarComFiltroComQtdAlbunsOrdenado(pesquisa, sortField, sortDir, semSort);
    }

    @Transactional(readOnly = true)
    public ArtistaDto buscarPorId(Long id) {
        Artista a = artistaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Artista não encontrado: " + id));
        return new ArtistaDto(a.getId(), a.getNome(), a.getGenero());
    }

    @Transactional
    public ArtistaDto atualizar(Long id, ArtistaDto dto) {
        Artista a = artistaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Artista não encontrado: " + id));

        a.setNome(dto.nome());
        a.setGenero(dto.genero());

        Artista salvo = artistaRepository.save(a);
        return new ArtistaDto(salvo.getId(), salvo.getNome(), salvo.getGenero());
    }

    @Transactional
    public void deletar(Long id) {
        if (!artistaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Artista não encontrado: " + id);
        }
        artistaRepository.deleteById(id);
    }
}
