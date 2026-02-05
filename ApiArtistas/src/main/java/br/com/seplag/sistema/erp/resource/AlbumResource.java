package br.com.seplag.sistema.erp.resource;

import br.com.seplag.sistema.erp.model.dto.AlbumComImagensDto;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

import br.com.seplag.sistema.erp.model.dto.AlbumDto;
import br.com.seplag.sistema.erp.service.AlbumService;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/v1/albuns")
@Tag(name = "Álbuns", description = "Operações de cadastro, consulta e upload de imagens de álbuns")
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
            @RequestParam(required = false) List<Long> artistaIds,
            @RequestParam(required = false) Long artistaId,
            @RequestParam(defaultValue = "") String titulo,
            @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        if ((artistaIds == null || artistaIds.isEmpty()) && artistaId != null) {
            artistaIds = List.of(artistaId);
        }
        return ResponseEntity.ok(albumService.listar(artistaIds, titulo, pageable));
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

    @PostMapping(value = "/with-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AlbumComImagensDto> criarComUpload(
            @RequestPart("dto") @Valid AlbumDto dto,
            @RequestPart(value = "arquivos", required = false) List<MultipartFile> arquivos,
            @RequestParam(value = "indiceCapa", required = false) Integer indiceCapa
    ) {
        AlbumComImagensDto criado = albumService.criarComUpload(dto, arquivos, indiceCapa);
        return ResponseEntity.created(URI.create("/albuns/" + criado.album().id())).body(criado);
    }
}
