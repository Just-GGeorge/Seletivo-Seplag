package br.com.seplag.sistema.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.seplag.sistema.erp.model.Album;

import java.util.List;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    List<Album> findByArtistaId(Long artistaId);
}