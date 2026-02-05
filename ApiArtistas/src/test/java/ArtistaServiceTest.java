
import br.com.seplag.sistema.erp.model.Artista;
import br.com.seplag.sistema.erp.model.dto.ArtistaDto;
import br.com.seplag.sistema.erp.model.dto.ArtistaListDto;
import br.com.seplag.sistema.erp.repository.ArtistaRepository;
import br.com.seplag.sistema.erp.service.ArtistaService;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArtistaServiceTest {

    @Mock ArtistaRepository artistaRepository;
    @InjectMocks
    ArtistaService service;

    @Test
    void criar_deveSalvarEDevolverDto() {
        var dto = new ArtistaDto(null, "Djavan", "MPB");

        var salvo = new Artista();
        salvo.setId(10L);
        salvo.setNome("Djavan");
        salvo.setGenero("MPB");

        when(artistaRepository.save(any(Artista.class))).thenReturn(salvo);

        var resp = service.criar(dto);

        assertThat(resp.id()).isEqualTo(10L);
        assertThat(resp.nome()).isEqualTo("Djavan");
        assertThat(resp.genero()).isEqualTo("MPB");

        ArgumentCaptor<Artista> captor = ArgumentCaptor.forClass(Artista.class);
        verify(artistaRepository).save(captor.capture());
        assertThat(captor.getValue().getId()).isNull();
        assertThat(captor.getValue().getNome()).isEqualTo("Djavan");
        assertThat(captor.getValue().getGenero()).isEqualTo("MPB");
    }

    @Test
    void buscarPorId_quandoNaoExiste_deveLancar404() {
        when(artistaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Artista não encontrado: 99");
    }

    @Test
    void buscarPorId_quandoExiste_deveRetornarDto() {
        var a = new Artista();
        a.setId(5L);
        a.setNome("Legião Urbana");
        a.setGenero("Rock");

        when(artistaRepository.findById(5L)).thenReturn(Optional.of(a));

        var dto = service.buscarPorId(5L);

        assertThat(dto.id()).isEqualTo(5L);
        assertThat(dto.nome()).isEqualTo("Legião Urbana");
        assertThat(dto.genero()).isEqualTo("Rock");
    }

    @Test
    void atualizar_quandoNaoExiste_deveLancar404() {
        when(artistaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.atualizar(1L, new ArtistaDto(null, "X", "Y")))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void atualizar_quandoExiste_deveSalvarEDevolverDto() {
        var existente = new Artista();
        existente.setId(1L);
        existente.setNome("A");
        existente.setGenero("G");

        when(artistaRepository.findById(1L)).thenReturn(Optional.of(existente));

        var salvo = new Artista();
        salvo.setId(1L);
        salvo.setNome("Novo");
        salvo.setGenero("Pop");

        when(artistaRepository.save(any(Artista.class))).thenReturn(salvo);

        var out = service.atualizar(1L, new ArtistaDto(null, "Novo", "Pop"));

        assertThat(out.nome()).isEqualTo("Novo");
        assertThat(out.genero()).isEqualTo("Pop");

        verify(artistaRepository).save(existente); // altera o mesmo objeto
        assertThat(existente.getNome()).isEqualTo("Novo");
        assertThat(existente.getGenero()).isEqualTo("Pop");
    }

    @Test
    void deletar_quandoNaoExiste_deveLancar404() {
        when(artistaRepository.existsById(7L)).thenReturn(false);

        assertThatThrownBy(() -> service.deletar(7L))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Artista não encontrado: 7");

        verify(artistaRepository, never()).deleteById(anyLong());
    }

    @Test
    void deletar_quandoExiste_deveDeletar() {
        when(artistaRepository.existsById(7L)).thenReturn(true);

        service.deletar(7L);

        verify(artistaRepository).deleteById(7L);
    }

    @Test
    void listar_deveExtrairSortFieldEDir_eChamarRepositoryComPageableSemSort() {
        Pageable pageable = PageRequest.of(2, 20, Sort.by(Sort.Order.desc("nome")));

        Page<ArtistaListDto> page = new PageImpl<>(
                java.util.List.of(new ArtistaListDto(1L, "A", "G", 0)),
                PageRequest.of(2, 20),
                41
        );

        when(artistaRepository.buscarComFiltroComQtdAlbunsOrdenado(
                eq("rock"), eq("nome"), eq("desc"), any(Pageable.class))
        ).thenReturn(page);

        var resp = service.listar("rock", pageable);

        assertThat(resp.getContent()).hasSize(1);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(artistaRepository).buscarComFiltroComQtdAlbunsOrdenado(
                eq("rock"), eq("nome"), eq("desc"), captor.capture()
        );

        Pageable usado = captor.getValue();
        assertThat(usado.getPageNumber()).isEqualTo(2);
        assertThat(usado.getPageSize()).isEqualTo(20);
        assertThat(usado.getSort().isSorted()).isFalse();
    }
}
