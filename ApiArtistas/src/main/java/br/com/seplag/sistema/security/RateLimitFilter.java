package br.com.seplag.sistema.security;


import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, io.github.bucket4j.Bucket> buckets = new ConcurrentHashMap<>();

    // 
    private final io.github.bucket4j.Bandwidth limit = io.github.bucket4j.Bandwidth.classic(
            40,
            io.github.bucket4j.Refill.intervally(40, Duration.ofMinutes(1))
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/auth/")
                || path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // só aplica para usuário autenticado
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            chain.doFilter(request, response);
            return;
        }

        // seu JwtAuthFilter usa subject (id) como principal
        String userKey = String.valueOf(auth.getPrincipal());

        io.github.bucket4j.Bucket bucket = buckets.computeIfAbsent(userKey, k -> io.github.bucket4j.Bucket.builder().addLimit(limit).build());

        io.github.bucket4j.ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (probe.isConsumed()) {
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            chain.doFilter(request, response);
            return;
        }

        long waitSeconds = Math.max(1, (long) Math.ceil(probe.getNanosToWaitForRefill() / 1_000_000_000.0));

        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(waitSeconds));
        response.setContentType("application/json");
        response.getWriter().write("""
            {
              "status": 429,
              "erro": "Too Many Requests",
              "mensagem": "Limite de 10 requisições por minuto excedido para este usuário."
            }
        """);
    }
}
