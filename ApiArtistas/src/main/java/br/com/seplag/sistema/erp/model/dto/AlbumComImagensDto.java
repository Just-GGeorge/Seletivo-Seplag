package br.com.seplag.sistema.erp.model.dto;

import java.util.List;

public record AlbumComImagensDto(
        AlbumDto album,
        List<ImagemAlbumDto> imagens,
        boolean uploadOk,
        String uploadErro
) {}
