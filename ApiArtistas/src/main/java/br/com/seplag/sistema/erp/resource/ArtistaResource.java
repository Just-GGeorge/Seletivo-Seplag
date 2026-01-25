package br.com.seplag.sistema.erp.resource;

import jakarta.validation.Valid;

import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import br.com.seplag.sistema.erp.model.dto.ArtistaDto;
import br.com.seplag.sistema.erp.service.ArtistaService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/artistas")
public class ArtistaResource {

	private final ArtistaService artistaService;

    public ArtistaResource(ArtistaService artistaService) {
        this.artistaService = artistaService;
    }

    @PostMapping
    public ResponseEntity<ArtistaDto> criar(@RequestBody @Valid ArtistaDto dto) {
        ArtistaDto criado = artistaService.criar(dto);
        return ResponseEntity.created(URI.create("/artistas/" + criado.id())).body(criado);
    }

    @GetMapping
    public ResponseEntity<Page<ArtistaDto>> listar(
    		@RequestParam(defaultValue = "") String nome,
            @RequestParam(defaultValue = "") String genero,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return ResponseEntity.ok(artistaService.listar(nome, genero, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ArtistaDto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(artistaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArtistaDto> atualizar(@PathVariable Long id, @RequestBody @Valid ArtistaDto dto) {
        return ResponseEntity.ok(artistaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        artistaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
