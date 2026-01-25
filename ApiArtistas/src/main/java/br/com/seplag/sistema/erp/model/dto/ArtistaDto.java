package br.com.seplag.sistema.erp.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ArtistaDto(
        Long id,

        @NotBlank(message = "nome é obrigatório")
        @Size(max = 255, message = "nome deve ter no máximo 255 caracteres")
        String nome,

        @Size(max = 100, message = "genero deve ter no máximo 100 caracteres")
        String genero
) {}