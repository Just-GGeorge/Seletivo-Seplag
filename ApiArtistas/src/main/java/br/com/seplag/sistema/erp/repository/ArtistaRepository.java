package br.com.seplag.sistema.erp.repository;

import br.com.seplag.sistema.erp.model.dto.ArtistaListDto;
import org.springframework.data.jpa.repository.JpaRepository;

import br.com.seplag.sistema.erp.model.Artista;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface ArtistaRepository extends JpaRepository<Artista, Long> {

    @Query("""
    SELECT new br.com.seplag.sistema.erp.model.dto.ArtistaListDto(
        a.id, a.nome, a.genero, COUNT(DISTINCT al.id)
    )
    FROM Artista a
    LEFT JOIN a.albuns al
    WHERE (:pesquisa IS NULL OR :pesquisa = ''
        OR LOWER(a.nome) LIKE CONCAT('%', LOWER(:pesquisa), '%')
        OR LOWER(a.genero) = LOWER(:pesquisa)
    )
    GROUP BY a.id, a.nome, a.genero
    ORDER BY
      CASE WHEN :sortField = 'qtdAlbuns' AND :sortDir = 'asc'  THEN COUNT(DISTINCT al.id) END ASC,
      CASE WHEN :sortField = 'qtdAlbuns' AND :sortDir = 'desc' THEN COUNT(DISTINCT al.id) END DESC,
      CASE WHEN :sortField = 'id'        AND :sortDir = 'asc'  THEN a.id END ASC,
      CASE WHEN :sortField = 'id'        AND :sortDir = 'desc' THEN a.id END DESC,
      CASE WHEN :sortField = 'nome'      AND :sortDir = 'asc'  THEN a.nome END ASC,
      CASE WHEN :sortField = 'nome'      AND :sortDir = 'desc' THEN a.nome END DESC,
      CASE WHEN :sortField = 'genero'    AND :sortDir = 'asc'  THEN a.genero END ASC,
      CASE WHEN :sortField = 'genero'    AND :sortDir = 'desc' THEN a.genero END DESC
""")
    Page<ArtistaListDto> buscarComFiltroComQtdAlbunsOrdenado(
            @Param("pesquisa") String pesquisa,
            @Param("sortField") String sortField,
            @Param("sortDir") String sortDir,
            Pageable pageable
    );

}