package br.com.seplag.sistema.erp.resource;

import br.com.seplag.sistema.erp.model.Regional;
import br.com.seplag.sistema.erp.service.RegionalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/regionais")
public class RegionalResource {

    private final RegionalService regionalService;

    public RegionalResource(RegionalService regionalService) {
        this.regionalService = regionalService;
    }

    @PostMapping("/sincronizar")
    public ResponseEntity<RegionalService.SyncResult> sincronizar() {
        return ResponseEntity.ok(regionalService.sincronizar());
    }

    @GetMapping
    public ResponseEntity<List<RegionalDto>> listarAtivas() {
        List<RegionalDto> list = regionalService.listarAtivas().stream()
                .map(r -> new RegionalDto(r.getIdExterno(), r.getNome(), r.getAtivo()))
                .toList();
        return ResponseEntity.ok(list);
    }

    public record RegionalDto(Integer id, String nome, Boolean ativo) {}
}
