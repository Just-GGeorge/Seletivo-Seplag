package br.com.seplag.sistema.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.seplag.sistema.erp.model.Album;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    
	@Query("""
		    SELECT al
		    FROM Album al
		    WHERE (:artistaId IS NULL OR al.artista.id = :artistaId)
		      AND (:titulo = '' OR LOWER(al.titulo) LIKE LOWER(CONCAT('%', :titulo, '%')))
		""")
        Page<Album> buscarComFiltro(@Param("artistaId") Long artistaId,@Param("titulo") String titulo,Pageable pageable);

        Page<Album> findByArtistaId(Long artistaId, Pageable pageable);
}