package br.com.seplag.sistema.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.seplag.sistema.erp.model.Album;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AlbumRepository extends JpaRepository<Album, Long> {

    @Query("""
    SELECT al
    FROM Album al
    WHERE (:titulo IS NULL OR :titulo = '' OR LOWER(al.titulo) LIKE CONCAT('%', LOWER(:titulo), '%'))
      AND (
        :artistaIds IS NULL OR EXISTS (
          SELECT 1
          FROM al.artistas ar
          WHERE ar.id IN :artistaIds
        )
      )
""")
    Page<Album> buscarComFiltro(
            @Param("artistaIds") List<Long> artistaIds,
            @Param("titulo") String titulo,
            Pageable pageable
    );

}