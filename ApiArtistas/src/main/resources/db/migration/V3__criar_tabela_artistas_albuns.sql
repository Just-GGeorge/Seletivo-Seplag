CREATE TABLE artistas_albuns (
    artista_id BIGINT NOT NULL,
    album_id BIGINT NOT NULL,

    CONSTRAINT pk_artistas_albuns PRIMARY KEY (artista_id, album_id),

    CONSTRAINT fk_artistas_albuns_artista
        FOREIGN KEY (artista_id)
        REFERENCES artistas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_artistas_albuns_album
        FOREIGN KEY (album_id)
        REFERENCES albuns(id)
        ON DELETE CASCADE
);

CREATE INDEX ix_artistas_albuns_album_id
    ON artistas_albuns(album_id);

CREATE INDEX ix_artistas_albuns_artista_id
    ON artistas_albuns(artista_id);
