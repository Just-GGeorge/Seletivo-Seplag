package br.com.seplag.sistema.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import br.com.seplag.sistema.erp.model.RefreshToken;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revogado = true WHERE rt.usuario.id = :usuarioId AND rt.revogado = false")
    int revogarTodosAtivosPorUsuario(Long usuarioId);
}
