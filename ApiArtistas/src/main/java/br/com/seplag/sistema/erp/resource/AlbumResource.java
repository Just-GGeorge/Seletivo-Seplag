package br.com.seplag.sistema.erp.resource;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

import br.com.seplag.sistema.erp.model.dto.AlbumDto;
import br.com.seplag.sistema.erp.service.AlbumService;

import java.net.URI;


@RestController
@RequestMapping("/albuns")
public class AlbumResource {

	private final AlbumService albumService;

    public AlbumResource(AlbumService albumService) {
        this.albumService = albumService;
    }

    @PostMapping
    public ResponseEntity<AlbumDto> criar(@RequestBody @Valid AlbumDto dto) {
        AlbumDto criado = albumService.criar(dto);
        return ResponseEntity.created(URI.create("/albuns/" + criado.id())).body(criado);
    }

    @GetMapping
    public ResponseEntity<Page<AlbumDto>> listar(
            @RequestParam(required = false) Long artistaId,
            @RequestParam(defaultValue = "") String titulo,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(albumService.listar(artistaId, titulo, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlbumDto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(albumService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlbumDto> atualizar(@PathVariable Long id, @RequestBody @Valid AlbumDto dto) {
        return ResponseEntity.ok(albumService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        albumService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
