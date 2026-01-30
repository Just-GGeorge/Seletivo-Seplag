package br.com.seplag.sistema.erp.model.dto.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken
) {}