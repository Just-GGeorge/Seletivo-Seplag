CREATE TABLE imagens_albuns (
    id BIGSERIAL PRIMARY KEY,
    album_id BIGINT NOT NULL,
    chave_objeto VARCHAR(500) NOT NULL,
    tipo_conteudo VARCHAR(100),
    tamanho_bytes BIGINT,
    eh_capa BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_imagens_albuns_album
        FOREIGN KEY (album_id)
        REFERENCES albuns(id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX ux_imagens_albuns_album_chave_objeto
    ON imagens_albuns(album_id, chave_objeto);

CREATE INDEX ix_imagens_albuns_album_id
    ON imagens_albuns(album_id);

CREATE UNIQUE INDEX ux_imagens_albuns_uma_capa_por_album
    ON imagens_albuns(album_id)
    WHERE eh_capa = TRUE;
