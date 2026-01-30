package br.com.seplag.sistema.security;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.seplag.sistema.erp.model.RefreshToken;
import br.com.seplag.sistema.erp.model.Usuario;
import br.com.seplag.sistema.erp.repository.RefreshTokenRepository;
import br.com.seplag.sistema.exception.RecursoNaoEncontradoException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;
    private final JwtProperties props;

    public RefreshTokenService(RefreshTokenRepository repo, JwtProperties props) {
        this.repo = repo;
        this.props = props;
    }

    @Transactional
    public String emitirNovo(Usuario usuario) {
        // opcional: revogar tokens antigos do usuário
        repo.revogarTodosAtivosPorUsuario(usuario.getId());

        RefreshToken rt = new RefreshToken();
        rt.setUsuario(usuario);
        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiracao(LocalDateTime.now().plusDays(props.refreshDaysOrDefault()));
        rt.setRevogado(false);

        repo.save(rt);
        return rt.getToken();
    }

    @Transactional
    public Usuario validarEObterUsuario(String token) {
        RefreshToken rt = repo.findByToken(token)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Refresh token inválido"));

        if (rt.isRevogado()) throw new RecursoNaoEncontradoException("Refresh token revogado");
        if (rt.getExpiracao().isBefore(LocalDateTime.now())) throw new RecursoNaoEncontradoException("Refresh token expirado");

        return rt.getUsuario();
    }

    @Transactional
    public void revogar(String token) {
        RefreshToken rt = repo.findByToken(token)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Refresh token inválido"));
        rt.setRevogado(true);
        repo.save(rt);
    }
}
