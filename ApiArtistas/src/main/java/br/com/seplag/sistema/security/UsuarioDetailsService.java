package br.com.seplag.sistema.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import br.com.seplag.sistema.erp.repository.UsuarioRepository;

@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository repo;
    private final JwtProperties props;

    public UsuarioDetailsService(UsuarioRepository repo, JwtProperties props) {
        this.repo = repo;
        this.props = props;
    }

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        String field = props.loginFieldOrDefault();

        var usuarioOpt = "nome".equalsIgnoreCase(field)
                ? repo.findByNomeIgnoreCase(login)
                : repo.findByEmailIgnoreCase(login);

        var usuario = usuarioOpt.orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        return User.builder()
                .username(login)
                .password(usuario.getSenhaHash())
                .disabled(!usuario.isAtivo())
                .authorities(new SimpleGrantedAuthority("ROLE_" + usuario.getPapel()))
                .build();
    }
}
