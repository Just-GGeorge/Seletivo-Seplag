CREATE TABLE regional (
  iden BIGSERIAL PRIMARY KEY,
  id_externo INTEGER NOT NULL,
  nome VARCHAR(200) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regional_id_externo ON regional(id_externo);
CREATE INDEX idx_regional_ativo ON regional(ativo);

CREATE UNIQUE INDEX uq_regional_id_externo_ativo_true
ON regional(id_externo)
WHERE ativo = TRUE;
