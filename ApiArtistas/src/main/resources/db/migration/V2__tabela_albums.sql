CREATE TABLE albuns (
    id BIGSERIAL PRIMARY KEY,
    artista_id BIGINT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    data_lancamento DATE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,

    CONSTRAINT fk_albuns_artistas
        FOREIGN KEY (artista_id)
        REFERENCES artistas(id)
        ON DELETE CASCADE
);