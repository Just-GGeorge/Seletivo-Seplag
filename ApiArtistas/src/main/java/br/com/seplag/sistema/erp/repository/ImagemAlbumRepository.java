package br.com.seplag.sistema.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.seplag.sistema.erp.model.ImagemAlbum;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ImagemAlbumRepository extends JpaRepository<ImagemAlbum, Long> {

    List<ImagemAlbum> findByAlbumId(Long albumId);

    Optional<ImagemAlbum> findByIdAndAlbumId(Long id, Long albumId);

    @Modifying
    @Query("UPDATE ImagemAlbum i SET i.ehCapa = false WHERE i.album.id = :albumId AND i.ehCapa = true")
    int desmarcarCapasDoAlbum(Long albumId);
}
