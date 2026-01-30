package br.com.seplag.sistema.erp.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record AlbumDto(
        Long id,
        @NotBlank String titulo,
        LocalDate dataLancamento,
        @NotNull List<Long> artistasIds
) {}