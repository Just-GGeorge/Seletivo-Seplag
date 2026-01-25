package br.com.seplag.sistema.erp.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ImagemAlbumDto(
        Long id,

        @NotBlank(message = "chaveObjeto é obrigatório")
        @Size(max = 500, message = "chaveObjeto deve ter no máximo 500 caracteres")
        String chaveObjeto,

        @Size(max = 100, message = "tipoConteudo deve ter no máximo 100 caracteres")
        String tipoConteudo,

        Long tamanhoBytes,

        Boolean ehCapa
) {}