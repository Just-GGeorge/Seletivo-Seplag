package br.com.seplag.sistema.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.seplag.sistema.erp.model.Artista;

public interface ArtistaRepository extends JpaRepository<Artista, Long> {
}