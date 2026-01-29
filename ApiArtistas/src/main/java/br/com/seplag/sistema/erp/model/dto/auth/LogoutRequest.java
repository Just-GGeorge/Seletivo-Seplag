package br.com.seplag.sistema.erp.model.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(
        @NotBlank String refreshToken
) {}