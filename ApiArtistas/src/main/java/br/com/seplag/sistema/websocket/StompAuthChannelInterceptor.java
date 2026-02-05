package br.com.seplag.sistema.websocket;

import br.com.seplag.sistema.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    public StompAuthChannelInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String auth = firstNativeHeader(accessor, "Authorization");

            if (auth == null || !auth.startsWith("Bearer ")) {
                throw new MessagingException("Missing Authorization Bearer token on STOMP CONNECT");
            }

            String token = auth.substring("Bearer ".length()).trim();

            Jws<Claims> claims = jwtService.validar(token);

            Long userId = Long.valueOf(claims.getBody().getSubject());
            String papel = claims.getBody().get("papel", String.class);

            Principal principal = new StompPrincipal(userId.toString());

            accessor.setUser(principal);

            // Possivel alteração para o uso de Roles
            // var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + papel));
            // Authentication a = new UsernamePasswordAuthenticationToken(userId.toString(), null, authorities);

            Authentication a = new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of());
            accessor.setHeader("wsAuth", a);
        }

        return message;
    }

    private static String firstNativeHeader(StompHeaderAccessor accessor, String name) {
        List<String> values = accessor.getNativeHeader(name);
        return (values == null || values.isEmpty()) ? null : values.get(0);
    }

    // Principal simples
    static class StompPrincipal implements Principal {
        private final String name;
        StompPrincipal(String name) { this.name = name; }
        @Override public String getName() { return name; }
    }
}
