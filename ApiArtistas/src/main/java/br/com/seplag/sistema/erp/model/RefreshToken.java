package br.com.seplag.sistema.erp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "token", nullable = false, length = 500)
    private String token;

    @Column(name = "expiracao", nullable = false)
    private LocalDateTime expiracao;

    @Column(name = "revogado", nullable = false)
    private boolean revogado = false;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void prePersist() { this.criadoEm = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public LocalDateTime getExpiracao() { return expiracao; }
    public void setExpiracao(LocalDateTime expiracao) { this.expiracao = expiracao; }
    public boolean isRevogado() { return revogado; }
    public void setRevogado(boolean revogado) { this.revogado = revogado; }
}
