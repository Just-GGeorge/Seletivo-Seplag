package br.com.seplag.sistema.erp.resource;

import br.com.seplag.sistema.erp.model.dto.auth.AuthResponse;
import br.com.seplag.sistema.erp.model.dto.auth.LoginRequest;
import br.com.seplag.sistema.erp.model.dto.auth.LogoutRequest;
import br.com.seplag.sistema.erp.model.dto.auth.RefreshRequest;
import br.com.seplag.sistema.erp.model.dto.auth.RegistrarRequest;
import br.com.seplag.sistema.erp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthResource {

    private final AuthService authService;

    public AuthResource(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<AuthResponse> registrar(@RequestBody @Valid RegistrarRequest req) {
        return ResponseEntity.status(201).body(authService.registrar(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody @Valid RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody @Valid LogoutRequest req) {
        authService.logout(req);
        return ResponseEntity.noContent().build();
    }
}
