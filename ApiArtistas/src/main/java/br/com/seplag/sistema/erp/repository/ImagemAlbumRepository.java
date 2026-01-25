package br.com.seplag.sistema.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.seplag.sistema.erp.model.ImagemAlbum;

import java.util.List;

public interface ImagemAlbumRepository extends JpaRepository<ImagemAlbum, Long> {
    List<ImagemAlbum> findByAlbumId(Long albumId);
}
