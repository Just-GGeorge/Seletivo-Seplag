package br.com.seplag.sistema.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
        String secret,
        String issuer,
        Integer accessMinutes,
        Integer refreshDays,
        String loginField
) {
    public int accessMinutesOrDefault() { return accessMinutes == null ? 5 : accessMinutes; }
    public int refreshDaysOrDefault() { return refreshDays == null ? 7 : refreshDays; }
    public String issuerOrDefault() { return (issuer == null || issuer.isBlank()) ? "api" : issuer; }
    public String loginFieldOrDefault() { return (loginField == null || loginField.isBlank()) ? "email" : loginField; }
}
