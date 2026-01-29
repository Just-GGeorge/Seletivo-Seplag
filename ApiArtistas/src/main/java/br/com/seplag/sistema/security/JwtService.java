package br.com.seplag.sistema.security;


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import br.com.seplag.sistema.erp.model.Usuario;

public class JwtService {

    private final JwtProperties props;
    private final byte[] keyBytes;

    public JwtService(JwtProperties props) {
        this.props = props;
        this.keyBytes = props.secret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalArgumentException("JWT_SECRET deve ter pelo menos 32 caracteres");
        }
    }

    public String gerarAccessToken(Usuario usuario) {
        Instant now = Instant.now();
        Instant exp = now.plus(props.accessMinutesOrDefault(), ChronoUnit.MINUTES);

        return Jwts.builder()
                .setIssuer(props.issuerOrDefault())
                .setSubject(String.valueOf(usuario.getId()))
                .claim("papel", usuario.getPapel())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(Keys.hmacShaKeyFor(keyBytes), SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> validar(String token) {
        return Jwts.parserBuilder()
                .requireIssuer(props.issuerOrDefault())
                .setSigningKey(Keys.hmacShaKeyFor(keyBytes))
                .build()
                .parseClaimsJws(token);
    }

    public Long getUsuarioId(String token) {
        return Long.valueOf(validar(token).getBody().getSubject());
    }
}