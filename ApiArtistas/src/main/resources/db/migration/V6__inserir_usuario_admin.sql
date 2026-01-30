INSERT INTO usuarios (nome, email, senha_hash, papel, ativo, criado_em)
VALUES (
    'Admin',
    'admin@local.com',
    '$2b$10$FWmCTLvWEU0iMxaSHLK9mefVCQrhp.epfrzmSnUUR2NDVlz3TUvSG',
    'ADMIN',
    TRUE,
    NOW()
)
ON CONFLICT (email) DO NOTHING;