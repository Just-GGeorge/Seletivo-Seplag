package br.com.seplag.sistema.erp.resource;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.seplag.sistema.erp.model.dto.ImagemAlbumDto;
import br.com.seplag.sistema.erp.service.ImagemAlbumService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/albuns/{albumId}/imagens")
public class ImagemAlbumResource {

	private final ImagemAlbumService imagemAlbumService;

    public ImagemAlbumResource(ImagemAlbumService imagemAlbumService) {
        this.imagemAlbumService = imagemAlbumService;
    }

    @GetMapping
    public ResponseEntity<List<ImagemAlbumDto>> listar(@PathVariable Long albumId) {
        return ResponseEntity.ok(imagemAlbumService.listarPorAlbum(albumId));
    }

    @PostMapping
    public ResponseEntity<ImagemAlbumDto> adicionar(@PathVariable Long albumId, @RequestBody @Valid ImagemAlbumDto dto) {
        ImagemAlbumDto criado = imagemAlbumService.adicionarAoAlbum(albumId, dto);
        return ResponseEntity.created(URI.create("/albuns/" + albumId + "/imagens/" + criado.id())).body(criado);
    }
}
