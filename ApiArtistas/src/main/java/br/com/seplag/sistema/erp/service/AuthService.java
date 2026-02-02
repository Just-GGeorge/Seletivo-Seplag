package br.com.seplag.sistema.erp.service;

import br.com.seplag.sistema.erp.model.Usuario;
import br.com.seplag.sistema.erp.model.dto.auth.AuthResponse;
import br.com.seplag.sistema.erp.model.dto.auth.LoginRequest;
import br.com.seplag.sistema.erp.model.dto.auth.LogoutRequest;
import br.com.seplag.sistema.erp.model.dto.auth.RefreshRequest;
import br.com.seplag.sistema.erp.model.dto.auth.RegistrarRequest;
import br.com.seplag.sistema.erp.repository.UsuarioRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;
import br.com.seplag.sistema.security.JwtService;
import br.com.seplag.sistema.security.RefreshTokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthService {

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(AuthenticationManager authManager,
                       UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService) {
        this.authManager = authManager;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse registrar(RegistrarRequest req) {
        if (usuarioRepository.existsByEmailIgnoreCase(req.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        Usuario u = new Usuario();
        u.setNome(req.nome());
        u.setEmail(req.email());
        u.setSenhaHash(passwordEncoder.encode(req.senha()));
        u.setPapel("USER");
        u.setAtivo(true);

        Usuario salvo = usuarioRepository.save(u);

        String access = jwtService.gerarAccessToken(salvo);
        String refresh = refreshTokenService.emitirNovo(salvo);

        return new AuthResponse(access, refresh);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        // autentica (vai validar senha e usuário habilitado)
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.login(), req.senha())
        );

        // recuperar usuário real (para emitir tokens)
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(req.login())
                .or(() -> usuarioRepository.findByNomeIgnoreCase(req.login()))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        String access = jwtService.gerarAccessToken(usuario);
        String refresh = refreshTokenService.emitirNovo(usuario);

        return new AuthResponse(access, refresh);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest req) {
        Usuario usuario = refreshTokenService.validarEObterUsuario(req.refreshToken());

        String access = jwtService.gerarAccessToken(usuario);
        String refresh = refreshTokenService.emitirNovo(usuario); // rotação

        return new AuthResponse(access, refresh);
    }

    @Transactional
    public void logout(LogoutRequest req) {
        refreshTokenService.revogar(req.refreshToken());
    }
}
