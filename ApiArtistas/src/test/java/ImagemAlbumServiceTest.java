
import br.com.seplag.sistema.erp.model.Album;
import br.com.seplag.sistema.erp.model.ImagemAlbum;
import br.com.seplag.sistema.erp.repository.AlbumRepository;
import br.com.seplag.sistema.erp.repository.ImagemAlbumRepository;
import br.com.seplag.sistema.erp.service.ImagemAlbumService;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;
import br.com.seplag.sistema.storage.ArquivoInvalidoException;
import br.com.seplag.sistema.storage.MinioStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImagemAlbumServiceTest {

    @Mock AlbumRepository albumRepository;
    @Mock ImagemAlbumRepository imagemAlbumRepository;
    @Mock MinioStorageService storage;

    @InjectMocks
    ImagemAlbumService service;

    @Test
    void listarPorAlbum_quandoAlbumNaoExiste_deveLancar404() {
        when(albumRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> service.listarPorAlbum(1L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void uploadMultiplasParaAlbum_quandoArquivosVazios_deveLancar() {
        var album = new Album();
        album.setId(1L);
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));

        assertThatThrownBy(() -> service.uploadMultiplasParaAlbum(1L, List.of(), null))
                .isInstanceOf(ArquivoInvalidoException.class)
                .hasMessageContaining("Arquivos são obrigatórios");
    }

    @Test
    void uploadMultiplasParaAlbum_quandoIndiceCapaInvalido_deveLancar() {
        var album = new Album();
        album.setId(1L);
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));

        var f = new MockMultipartFile("f", "a.png", "image/png", "x".getBytes());

        assertThatThrownBy(() -> service.uploadMultiplasParaAlbum(1L, List.of(f), 2))
                .isInstanceOf(ArquivoInvalidoException.class)
                .hasMessageContaining("indiceCapa inválido");
    }

    @Test
    void uploadMultiplasParaAlbum_quandoTemCapa_deveDesmarcarCapasAntes() throws Exception {
        var album = new Album();
        album.setId(1L);
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));

        var f1 = new MockMultipartFile("f", "a.png", "image/png", "x".getBytes());
        var f2 = new MockMultipartFile("f", "b.png", "image/png", "y".getBytes());

        when(storage.gerarObjectKeyAlbum(eq(1L), anyString()))
                .thenReturn("k1", "k2");

        when(imagemAlbumRepository.save(any(ImagemAlbum.class)))
                .thenAnswer(inv -> {
                    ImagemAlbum i = inv.getArgument(0);
                    i.setId(i.isEhCapa() ? 100L : 101L);
                    return i;
                });

        var out = service.uploadMultiplasParaAlbum(1L, List.of(f1, f2), 1);

        verify(imagemAlbumRepository).desmarcarCapasDoAlbum(1L);
        assertThat(out).hasSize(2);
        assertThat(out.get(0).ehCapa()).isFalse();
        assertThat(out.get(1).ehCapa()).isTrue();

        verify(storage).upload(eq("k1"), any(), eq((long)f1.getSize()), eq("image/png"));
        verify(storage).upload(eq("k2"), any(), eq((long)f2.getSize()), eq("image/png"));
    }

    @Test
    void uploadMultiplasParaAlbum_quandoFalharNoMeio_deveDeletarObjetosEnviados() throws Exception {
        var album = new Album();
        album.setId(1L);
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));

        var f1 = new MockMultipartFile("f", "a.png", "image/png", "x".getBytes());
        var f2 = new MockMultipartFile("f", "b.png", "image/png", "y".getBytes());

        // Simular erro ao fazer upload de 2 imagens com a primeira passando segunda dando erro
        when(storage.gerarObjectKeyAlbum(eq(1L), anyString()))
                .thenReturn("k1")
                .thenThrow(new RuntimeException("boom"));

        assertThatThrownBy(() -> service.uploadMultiplasParaAlbum(1L, List.of(f1, f2), null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Falha ao enviar imagens para o MinIO");

        // remover a imagem enviada visto que a segunda deu erro
        verify(storage).upload(eq("k1"), any(), anyLong(), eq("image/png"));
        verify(storage).delete("k1");
    }


    @Test
    void definirCapa_deveDesmarcarAntigasESalvarNova() {
        var img = new ImagemAlbum();
        img.setId(10L);
        img.setEhCapa(false);

        when(imagemAlbumRepository.findByIdAndAlbumId(10L, 1L)).thenReturn(Optional.of(img));
        when(imagemAlbumRepository.save(any(ImagemAlbum.class))).thenAnswer(inv -> inv.getArgument(0));

        var out = service.definirCapa(1L, 10L);

        verify(imagemAlbumRepository).desmarcarCapasDoAlbum(1L);
        verify(imagemAlbumRepository).save(img);
        assertThat(out.ehCapa()).isTrue();
    }

    @Test
    void gerarUrlAssinada_deveChamarStorage() throws Exception {
        var img = new ImagemAlbum();
        img.setId(10L);
        img.setChaveObjeto("key");

        when(imagemAlbumRepository.findByIdAndAlbumId(10L, 1L)).thenReturn(Optional.of(img));
        when(storage.presignedGetUrl("key", 30*60)).thenReturn("http://signed");

        var url = service.gerarUrlAssinada(1L, 10L);

        assertThat(url).contains("http://signed");
    }

    @Test
    void deletarImagem_deveRemoverDoMinioEDoBanco() throws Exception {
        var img = new ImagemAlbum();
        img.setId(10L);
        img.setChaveObjeto("key");

        when(imagemAlbumRepository.findByIdAndAlbumId(10L, 1L)).thenReturn(Optional.of(img));

        service.deletarImagem(1L, 10L);

        verify(storage).delete("key");
        verify(imagemAlbumRepository).delete(img);
    }

    @Test
    void uploadMultiplasParaAlbumOpcional_quandoArquivosVazios_deveRetornarListaVazia() throws Exception {
        var album = new Album();
        album.setId(1L);
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));

        var out = service.uploadMultiplasParaAlbumOpcional(1L, List.of(), null);

        assertThat(out).isEmpty();
        verify(storage, never()).upload(any(), any(), anyLong(), any());
    }

    @Test
    void uploadMultiplasParaAlbumOpcional_quandoIndiceCapaInvalido_deveNormalizarPara0() throws Exception {
        var album = new Album();
        album.setId(1L);
        when(albumRepository.findById(1L)).thenReturn(Optional.of(album));

        var f1 = new MockMultipartFile("f", "a.png", "image/png", "x".getBytes());
        var f2 = new MockMultipartFile("f", "b.png", "image/png", "y".getBytes());

        when(storage.gerarObjectKeyAlbum(eq(1L), anyString()))
                .thenReturn("k1", "k2");

        when(imagemAlbumRepository.save(any(ImagemAlbum.class)))
                .thenAnswer(inv -> {
                    ImagemAlbum i = inv.getArgument(0);
                    i.setId(1L);
                    return i;
                });

        var out = service.uploadMultiplasParaAlbumOpcional(1L, List.of(f1, f2), 99);

        assertThat(out).hasSize(2);
        assertThat(out.get(0).ehCapa()).isTrue();  // normalizou para 0
        assertThat(out.get(1).ehCapa()).isFalse();
    }
}
