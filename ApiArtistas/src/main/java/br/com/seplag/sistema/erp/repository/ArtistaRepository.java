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
        WHERE (:pesquisa IS NULL OR :pesquisa = ''
            OR LOWER(a.nome) LIKE CONCAT('%', LOWER(:pesquisa), '%')
            OR LOWER(a.genero) = LOWER(:pesquisa)
        )
    """)
    Page<Artista> buscarComFiltro(
            @Param("pesquisa") String pesquisa,
            Pageable pageable
    );
}