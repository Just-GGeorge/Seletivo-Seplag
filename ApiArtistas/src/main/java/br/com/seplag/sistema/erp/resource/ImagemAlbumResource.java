package br.com.seplag.sistema.erp.resource;

import br.com.seplag.sistema.erp.model.dto.ImagemAlbumComUrlDto;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.seplag.sistema.erp.model.dto.ImagemAlbumDto;
import br.com.seplag.sistema.erp.service.ImagemAlbumService;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/albuns/{albumId}/imagens")
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

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<ImagemAlbumDto>> uploadMultiplas(
            @PathVariable Long albumId,
            @RequestPart("arquivos") List<MultipartFile> arquivos,
            @RequestParam(required = false) Integer indiceCapa
    ) {
        List<ImagemAlbumDto> criadas = imagemAlbumService.uploadMultiplasParaAlbum(albumId, arquivos, indiceCapa);
        return ResponseEntity.status(201).body(criadas);
    }

    @PatchMapping("/{imagemId}/capa")
    public ResponseEntity<ImagemAlbumDto> definirCapa(
            @PathVariable Long albumId,
            @PathVariable Long imagemId
    ) {
        return ResponseEntity.ok(imagemAlbumService.definirCapa(albumId, imagemId));
    }

    @GetMapping("/{imagemId}/url")
    public ResponseEntity<?> urlAssinada(
            @PathVariable Long albumId,
            @PathVariable Long imagemId
    ) {
        String url = imagemAlbumService.gerarUrlAssinada(albumId, imagemId);
        return ResponseEntity.ok(new UrlDto(url));
    }

    @DeleteMapping("/{imagemId}")
    public ResponseEntity<Void> deletar(@PathVariable Long albumId, @PathVariable Long imagemId) {
        imagemAlbumService.deletarImagem(albumId, imagemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/urls")
    public ResponseEntity<List<ImagemAlbumComUrlDto>> listarComUrls(
            @PathVariable Long albumId
    ) {
        return ResponseEntity.ok(imagemAlbumService.listarPorAlbumComUrl(albumId));
    }

    public record UrlDto(String url) {}
}
