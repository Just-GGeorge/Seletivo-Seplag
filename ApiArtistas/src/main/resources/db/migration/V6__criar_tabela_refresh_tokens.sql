CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expiracao TIMESTAMP NOT NULL,
    revogado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_tokens_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX ux_refresh_tokens_token
    ON refresh_tokens(token);

CREATE INDEX ix_refresh_tokens_usuario_revogado
    ON refresh_tokens(usuario_id, revogado);

CREATE INDEX ix_refresh_tokens_expiracao
    ON refresh_tokens(expiracao)