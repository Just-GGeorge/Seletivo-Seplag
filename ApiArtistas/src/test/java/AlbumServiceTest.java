
import br.com.seplag.sistema.erp.model.Album;
import br.com.seplag.sistema.erp.model.Artista;
import br.com.seplag.sistema.erp.model.dto.AlbumDto;
import br.com.seplag.sistema.erp.repository.AlbumRepository;
import br.com.seplag.sistema.erp.repository.ArtistaRepository;
import br.com.seplag.sistema.erp.service.AlbumService;
import br.com.seplag.sistema.erp.service.ImagemAlbumService;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlbumServiceTest {

    @Mock AlbumRepository albumRepository;
    @Mock ArtistaRepository artistaRepository;
    @Mock
    ImagemAlbumService imagemAlbumService;

    @InjectMocks
    AlbumService service;

    @Test
    void criar_deveSalvarAlbumComArtistas() {
        var dto = new AlbumDto(null, "Alucinação", LocalDate.of(1976, 1, 1), List.of(1L, 2L));

        var a1 = new Artista(); a1.setId(1L);
        var a2 = new Artista(); a2.setId(2L);

        when(artistaRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(a1, a2));

        var salvo = new Album();
        salvo.setId(10L);
        salvo.setTitulo("Alucinação");
        salvo.setDataLancamento(dto.dataLancamento());
        salvo.setArtistas(List.of(a1, a2));

        when(albumRepository.save(any(Album.class))).thenReturn(salvo);

        var out = service.criar(dto);

        assertThat(out.id()).isEqualTo(10L);
        assertThat(out.titulo()).isEqualTo("Alucinação");
        assertThat(out.artistasIds()).containsExactlyInAnyOrder(1L, 2L);
    }

    @Test
    void criar_quandoAlgumArtistaNaoExiste_deveLancar() {
        var dto = new AlbumDto(null, "X", null, List.of(1L, 2L));
        var a1 = new Artista(); a1.setId(1L);

        when(artistaRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(a1)); // faltou o 2

        assertThatThrownBy(() -> service.criar(dto))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Um ou mais artistas informados não existem");

        verify(albumRepository, never()).save(any());
    }

    @Test
    void listar_quandoArtistaIdsVazio_devePassarNullProRepo() {
        Pageable pageable = PageRequest.of(0, 10);

        when(albumRepository.buscarComFiltro(isNull(), eq("t"), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of()));

        service.listar(List.of(), "t", pageable);

        verify(albumRepository).buscarComFiltro(isNull(), eq("t"), eq(pageable));
    }

    @Test
    void buscarPorId_quandoNaoExiste_deveLancar404() {
        when(albumRepository.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(9L))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Álbum não encontrado: 9");
    }

    @Test
    void atualizar_deveAtualizarCamposEArtistas() {
        var existente = new Album();
        existente.setId(1L);
        existente.setTitulo("A");
        existente.setArtistas(List.of());

        when(albumRepository.findById(1L)).thenReturn(Optional.of(existente));

        var a1 = new Artista(); a1.setId(10L);
        when(artistaRepository.findAllById(List.of(10L))).thenReturn(List.of(a1));

        var salvo = new Album();
        salvo.setId(1L);
        salvo.setTitulo("Novo");
        salvo.setDataLancamento(LocalDate.of(2020, 1, 1));
        salvo.setArtistas(List.of(a1));

        when(albumRepository.save(any(Album.class))).thenReturn(salvo);

        var out = service.atualizar(1L, new AlbumDto(null, "Novo", LocalDate.of(2020,1,1), List.of(10L)));

        assertThat(out.titulo()).isEqualTo("Novo");
        assertThat(out.artistasIds()).containsExactly(10L);
    }

    @Test
    void deletar_quandoNaoExiste_deveLancar404() {
        when(albumRepository.existsById(3L)).thenReturn(false);

        assertThatThrownBy(() -> service.deletar(3L))
                .isInstanceOf(RecursoNaoEncontradoException.class);

        verify(albumRepository, never()).deleteById(anyLong());
    }

    @Test
    void deletar_quandoExiste_deveDeletar() {
        when(albumRepository.existsById(3L)).thenReturn(true);

        service.deletar(3L);

        verify(albumRepository).deleteById(3L);
    }
}
