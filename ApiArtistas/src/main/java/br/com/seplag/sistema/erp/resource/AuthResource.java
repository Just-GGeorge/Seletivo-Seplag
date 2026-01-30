package br.com.seplag.sistema.erp.resource;

import jakarta.validation.Valid;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.seplag.sistema.erp.model.Usuario;
import br.com.seplag.sistema.erp.model.dto.auth.AuthResponse;
import br.com.seplag.sistema.erp.model.dto.auth.LoginRequest;
import br.com.seplag.sistema.erp.model.dto.auth.LogoutRequest;
import br.com.seplag.sistema.erp.model.dto.auth.RefreshRequest;
import br.com.seplag.sistema.erp.repository.UsuarioRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;
import br.com.seplag.sistema.security.JwtService;
import br.com.seplag.sistema.security.RefreshTokenService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthResource {

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthResource(AuthenticationManager authManager,
                          UsuarioRepository usuarioRepository,
                          JwtService jwtService,
                          RefreshTokenService refreshTokenService) {
        this.authManager = authManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.login(), req.senha())
        );

        // recuperar usuário real (para emitir tokens)
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(req.login())
                .or(() -> usuarioRepository.findByNomeIgnoreCase(req.login()))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));

        String access = jwtService.gerarAccessToken(usuario);
        String refresh = refreshTokenService.emitirNovo(usuario);

        return ResponseEntity.ok(new AuthResponse(access, refresh));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody @Valid RefreshRequest req) {
        Usuario usuario = refreshTokenService.validarEObterUsuario(req.refreshToken());
        String access = jwtService.gerarAccessToken(usuario);
        String refresh = refreshTokenService.emitirNovo(usuario); // rotação
        return ResponseEntity.ok(new AuthResponse(access, refresh));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody @Valid LogoutRequest req) {
        refreshTokenService.revogar(req.refreshToken());
        return ResponseEntity.noContent().build();
    }
}