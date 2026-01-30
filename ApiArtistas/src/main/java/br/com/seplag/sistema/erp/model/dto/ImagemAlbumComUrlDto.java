package br.com.seplag.sistema.erp.model.dto;

public record ImagemAlbumComUrlDto(
        Long id,
        String chaveObjeto,
        String tipoConteudo,
        Long tamanhoBytes,
        Boolean ehCapa,
        String url
) {}
