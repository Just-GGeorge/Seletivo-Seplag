package br.com.seplag.sistema.erp.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AlbumDto(
        Long id,

        @NotNull(message = "artistaId é obrigatório")
        Long artistaId,

        @NotBlank(message = "titulo é obrigatório")
        @Size(max = 255, message = "titulo deve ter no máximo 255 caracteres")
        String titulo,

        LocalDate dataLancamento
) {}