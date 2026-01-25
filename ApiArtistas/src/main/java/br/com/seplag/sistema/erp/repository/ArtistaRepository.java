package br.com.seplag.sistema.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.seplag.sistema.erp.model.Artista;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ArtistaRepository extends JpaRepository<Artista, Long> {
	
	@Query("""
		    SELECT a
		    FROM Artista a
		    WHERE (:nome IS NULL OR LOWER(a.nome) LIKE CONCAT('%', :nome, '%'))
		      AND (:genero IS NULL OR LOWER(a.genero) = :genero)
		""")
	    Page<Artista> buscarComFiltro(
	            @Param("nome") String nome,
	            @Param("genero") String genero,
	            Pageable pageable
	    );
}