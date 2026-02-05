package br.com.seplag.sistema.erp.model.dto;

public record ArtistaListDto(
        Long id,
        String nome,
        String genero,
        long qtdAlbuns
) {}

