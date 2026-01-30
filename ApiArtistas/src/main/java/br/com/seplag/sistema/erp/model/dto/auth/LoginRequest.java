package br.com.seplag.sistema.erp.model.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String login,  // definido pelo .env jwt.login-field
        @NotBlank String senha
) {}