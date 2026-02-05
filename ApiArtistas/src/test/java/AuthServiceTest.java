
import br.com.seplag.sistema.erp.model.Usuario;
import br.com.seplag.sistema.erp.model.dto.auth.*;
import br.com.seplag.sistema.erp.repository.UsuarioRepository;
import br.com.seplag.sistema.erp.service.AuthService;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;
import br.com.seplag.sistema.security.JwtService;
import br.com.seplag.sistema.security.RefreshTokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock AuthenticationManager authManager;
    @Mock UsuarioRepository usuarioRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock RefreshTokenService refreshTokenService;

    @InjectMocks
    AuthService service;

    @Test
    void registrar_quandoEmailJaExiste_deveLancar() {
        when(usuarioRepository.existsByEmailIgnoreCase("a@a.com")).thenReturn(true);

        assertThatThrownBy(() -> service.registrar(new RegistrarRequest("A", "a@a.com", "123")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("E-mail já cadastrado");

        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void registrar_deveSalvarUsuarioEEmitirTokens() {
        when(usuarioRepository.existsByEmailIgnoreCase("a@a.com")).thenReturn(false);
        when(passwordEncoder.encode("123")).thenReturn("HASH");

        var salvo = new Usuario();
        salvo.setId(10L);
        salvo.setNome("A");
        salvo.setEmail("a@a.com");
        salvo.setSenhaHash("HASH");
        salvo.setPapel("USER");
        salvo.setAtivo(true);

        when(usuarioRepository.save(any(Usuario.class))).thenReturn(salvo);
        when(jwtService.gerarAccessToken(salvo)).thenReturn("ACCESS");
        when(refreshTokenService.emitirNovo(salvo)).thenReturn("REFRESH");

        var out = service.registrar(new RegistrarRequest("A", "a@a.com", "123"));

        assertThat(out.accessToken()).isEqualTo("ACCESS");
        assertThat(out.refreshToken()).isEqualTo("REFRESH");

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertThat(captor.getValue().getSenhaHash()).isEqualTo("HASH");
        assertThat(captor.getValue().getPapel()).isEqualTo("USER");
        assertThat(captor.getValue().isAtivo()).isTrue();
    }

    @Test
    void login_quandoUsuarioNaoEncontrado_deveLancar() {
        when(usuarioRepository.findByEmailIgnoreCase("login")).thenReturn(Optional.empty());
        when(usuarioRepository.findByNomeIgnoreCase("login")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.login(new LoginRequest("login", "123")))
                .isInstanceOf(RecursoNaoEncontradoException.class)
                .hasMessageContaining("Usuário não encontrado");
    }

    @Test
    void login_deveAutenticarBuscarUsuarioEmitirTokens() {
        var u = new Usuario();
        u.setId(1L);
        u.setNome("Fulano");
        u.setEmail("fulano@x.com");

        when(usuarioRepository.findByEmailIgnoreCase("fulano@x.com")).thenReturn(Optional.of(u));
        when(jwtService.gerarAccessToken(u)).thenReturn("A");
        when(refreshTokenService.emitirNovo(u)).thenReturn("R");

        var out = service.login(new LoginRequest("fulano@x.com", "123"));

        assertThat(out.accessToken()).isEqualTo("A");
        assertThat(out.refreshToken()).isEqualTo("R");

        verify(authManager).authenticate(any());
    }

    @Test
    void refresh_deveValidarEEmitirNovosTokens() {
        var u = new Usuario();
        u.setId(2L);

        when(refreshTokenService.validarEObterUsuario("RT")).thenReturn(u);
        when(jwtService.gerarAccessToken(u)).thenReturn("A2");
        when(refreshTokenService.emitirNovo(u)).thenReturn("RT2");

        var out = service.refresh(new RefreshRequest("RT"));

        assertThat(out.accessToken()).isEqualTo("A2");
        assertThat(out.refreshToken()).isEqualTo("RT2");
    }

    @Test
    void logout_deveRevogar() {
        service.logout(new LogoutRequest("RT"));
        verify(refreshTokenService).revogar("RT");
    }
}
