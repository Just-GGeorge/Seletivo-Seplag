
import br.com.seplag.sistema.erp.model.Regional;
import br.com.seplag.sistema.erp.model.dto.RegionalExternaDto;
import br.com.seplag.sistema.erp.repository.RegionalRepository;
import br.com.seplag.sistema.erp.service.RegionalService;
import br.com.seplag.sistema.security.RegionaisClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegionalServiceTest {

    @Mock RegionalRepository regionalRepository;
    @Mock RegionaisClient regionaisClient;

    @InjectMocks
    RegionalService service;

    @Test
    void sincronizar_deveInserirNovas() {
        when(regionaisClient.listar()).thenReturn(List.of(
                new RegionalExternaDto(1, "R1")
        ));
        when(regionalRepository.findByAtivoTrue()).thenReturn(List.of());

        var res = service.sincronizar();

        assertThat(res.inseridos()).isEqualTo(1);
        assertThat(res.alterados()).isEqualTo(0);
        assertThat(res.inativadosPorAusencia()).isEqualTo(0);

        @SuppressWarnings("rawtypes")
        ArgumentCaptor<Iterable> captor = ArgumentCaptor.forClass(Iterable.class);

        verify(regionalRepository).saveAll(captor.capture());

        Iterable<Regional> it = (Iterable<Regional>) captor.getValue();
        List<Regional> list = new ArrayList<>();
        it.forEach(list::add);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getIdExterno()).isEqualTo(1);
        assertThat(list.get(0).getNome()).isEqualTo("R1");
        assertThat(list.get(0).getAtivo()).isTrue();

        verify(regionalRepository, never()).inativarAtivoPorIdExterno(anyInt());
        verify(regionalRepository, never()).inativarAtivosPorIdExterno(anyList());
    }

    @Test
    void sincronizar_quandoNomeAlterou_deveInativarEInserirNovo() {
        when(regionaisClient.listar()).thenReturn(List.of(
                new RegionalExternaDto(10, "Novo Nome")
        ));

        Regional ativo = new Regional();
        ativo.setIdExterno(10);
        ativo.setNome("Antigo Nome");
        ativo.setAtivo(true);

        when(regionalRepository.findByAtivoTrue()).thenReturn(List.of(ativo));

        var res = service.sincronizar();

        assertThat(res.inseridos()).isEqualTo(0);
        assertThat(res.alterados()).isEqualTo(1);
        assertThat(res.inativadosPorAusencia()).isEqualTo(0);

        verify(regionalRepository).inativarAtivoPorIdExterno(10);

        @SuppressWarnings("rawtypes")
        ArgumentCaptor<Iterable> captor = ArgumentCaptor.forClass(Iterable.class);
        verify(regionalRepository).saveAll(captor.capture());

        Iterable<Regional> it = (Iterable<Regional>) captor.getValue();
        List<Regional> list = new ArrayList<>();
        it.forEach(list::add);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getIdExterno()).isEqualTo(10);
        assertThat(list.get(0).getNome()).isEqualTo("Novo Nome");
        assertThat(list.get(0).getAtivo()).isTrue();

        verify(regionalRepository, never()).inativarAtivosPorIdExterno(anyList());
    }

    @Test
    void sincronizar_quandoAusenteNoEndpoint_deveInativarPorAusencia() {
        when(regionaisClient.listar()).thenReturn(List.of(
                new RegionalExternaDto(1, "R1")
        ));

        Regional r1 = new Regional();
        r1.setIdExterno(1);
        r1.setNome("R1");
        r1.setAtivo(true);

        Regional r2 = new Regional();
        r2.setIdExterno(2);
        r2.setNome("R2");
        r2.setAtivo(true);

        when(regionalRepository.findByAtivoTrue()).thenReturn(List.of(r1, r2));
        when(regionalRepository.inativarAtivosPorIdExterno(List.of(2))).thenReturn(1);

        var res = service.sincronizar();

        assertThat(res.inseridos()).isEqualTo(0);
        assertThat(res.alterados()).isEqualTo(0);
        assertThat(res.inativadosPorAusencia()).isEqualTo(1);

        verify(regionalRepository).inativarAtivosPorIdExterno(List.of(2));
        verify(regionalRepository, never()).inativarAtivoPorIdExterno(anyInt());
    }

    @Test
    void sincronizar_quandoClientRetornaNull_naoDeveQuebrar() {
        when(regionaisClient.listar()).thenReturn(null);
        when(regionalRepository.findByAtivoTrue()).thenReturn(List.of());

        var res = service.sincronizar();

        assertThat(res.inseridos()).isEqualTo(0);
        assertThat(res.alterados()).isEqualTo(0);
        assertThat(res.inativadosPorAusencia()).isEqualTo(0);

        verify(regionalRepository, never()).saveAll(anyIterable());
        verify(regionalRepository, never()).inativarAtivosPorIdExterno(anyList());
        verify(regionalRepository, never()).inativarAtivoPorIdExterno(anyInt());
    }

    @Test
    void sincronizar_deveIgnorarItensNulosOuSemId_semQuebrar() {
        when(regionaisClient.listar()).thenReturn(java.util.Arrays.asList(
                null,
                new RegionalExternaDto(null, "Sem id"),
                new RegionalExternaDto(1, "R1")
        ));
        when(regionalRepository.findByAtivoTrue()).thenReturn(List.of());

        var res = service.sincronizar();

        assertThat(res.inseridos()).isEqualTo(1);
        assertThat(res.alterados()).isEqualTo(0);

        verify(regionalRepository).saveAll(anyIterable());
    }

}
