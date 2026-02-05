package br.com.seplag.sistema.erp.repository;

import br.com.seplag.sistema.erp.model.Regional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RegionalRepository extends JpaRepository<Regional, Long> {

    List<Regional> findByAtivoTrue();

    @Modifying
    @Query("UPDATE Regional r SET r.ativo = false WHERE r.ativo = true AND r.idExterno IN :ids")
    int inativarAtivosPorIdExterno(@Param("ids") List<Integer> ids);

    @Modifying
    @Query("UPDATE Regional r SET r.ativo = false WHERE r.ativo = true AND r.idExterno = :idExterno")
    int inativarAtivoPorIdExterno(@Param("idExterno") Integer idExterno);
}
