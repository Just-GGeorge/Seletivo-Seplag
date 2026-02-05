package br.com.seplag.sistema.erp.service;

import br.com.seplag.sistema.erp.model.Regional;
import br.com.seplag.sistema.erp.model.dto.RegionalExternaDto;
import br.com.seplag.sistema.erp.repository.RegionalRepository;
import br.com.seplag.sistema.security.RegionaisClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RegionalService {

    private final RegionalRepository regionalRepository;
    private final RegionaisClient regionaisClient;

    public RegionalService(RegionalRepository regionalRepository, RegionaisClient regionaisClient) {
        this.regionalRepository = regionalRepository;
        this.regionaisClient = regionaisClient;
    }

    @Transactional
    public SyncResult sincronizar() {
        List<RegionalExternaDto> externas = regionaisClient.listar();
        if (externas == null) externas = List.of();

        List<Regional> ativos = regionalRepository.findByAtivoTrue();

        Map<Integer, Regional> ativoPorIdExterno = ativos.stream()
                .filter(r -> r.getIdExterno() != null)
                .collect(Collectors.toMap(Regional::getIdExterno, r -> r, (a, b) -> a));

        Set<Integer> idsNoEndpoint = new HashSet<>();
        List<Regional> paraInserir = new ArrayList<>();

        int inseridos = 0;
        int inativadosPorAusencia = 0;
        int alterados = 0;

        for (RegionalExternaDto ext : externas) {
            if (ext == null || ext.id() == null) continue;

            Integer idExterno = ext.id();
            String nomeNovo = normalize(ext.nome());

            idsNoEndpoint.add(idExterno);

            Regional atualAtivo = ativoPorIdExterno.get(idExterno);

            if (atualAtivo == null) {
                Regional novo = new Regional();
                novo.setIdExterno(idExterno);
                novo.setNome(nomeNovo);
                novo.setAtivo(true);
                paraInserir.add(novo);
                inseridos++;
                continue;
            }

            String nomeAtual = normalize(atualAtivo.getNome());
            if (!nomeAtual.equalsIgnoreCase(nomeNovo)) {
                regionalRepository.inativarAtivoPorIdExterno(idExterno);

                Regional novo = new Regional();
                novo.setIdExterno(idExterno);
                novo.setNome(nomeNovo);
                novo.setAtivo(true);
                paraInserir.add(novo);

                alterados++;
            }
        }

        if (!paraInserir.isEmpty()) {
            regionalRepository.saveAll(paraInserir);
        }

        List<Integer> ausentes = ativos.stream()
                .map(Regional::getIdExterno)
                .filter(Objects::nonNull)
                .filter(id -> !idsNoEndpoint.contains(id))
                .toList();

        if (!ausentes.isEmpty()) {
            inativadosPorAusencia = regionalRepository.inativarAtivosPorIdExterno(ausentes);
        }

        return new SyncResult(inseridos, alterados, inativadosPorAusencia);
    }

    @Transactional(readOnly = true)
    public List<Regional> listarAtivas() {
        return regionalRepository.findByAtivoTrue();
    }

    private static String normalize(String s) {
        return s == null ? "" : s.trim();
    }

    public record SyncResult(int inseridos, int alterados, int inativadosPorAusencia) {}
}
