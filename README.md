# Projeto-pratico
 Projeto prático PROCESSO SELETIVO CONJUNTO Nº 001/2026/SEPLAG e demais Órgãos - Engenheiro da Computação- Sênior

github: https://github.com/Just-GGeorge/Seletivo-Seplag

Candidato: Guilherme George Oliveira da Silva

email: guilhermegeorge06@gmail.com

## Projeto Full-Stack [Discografia – CRUD de Artistas & Álbuns (API + Front)]


Aplicação full-stack para cadastro e consulta de **Artistas** e **Álbuns**, com persistência em **PostgreSQL**, armazenamento de imagens em **MinIO** e autenticação **JWT** (access + refresh).  
Back-end em **Spring Boot (Java 17)** com **Flyway** e health checks via **Actuator**.  
Front-end em **React + TypeScript**.

---

## Stack

**Back-end**
- Java 17 + Spring Boot 3.x
- Spring Security + JWT (access 5 min, refresh 7 dias)
- Spring Data JPA
- Flyway (migrations)
- PostgreSQL 15
- MinIO (S3 compatível) para imagens
- Actuator (liveness/readiness)

**Front-end**
- React + TypeScript
- Vite

---

## Serviços (Docker Compose)

O `docker-compose.yml` sobe:

- **postgres**: PostgreSQL
- **minio**: storage compatível com S3
- **minio-init**: cria o bucket `fotos` (uma vez)
- **api**: aplicação Spring Boot
- **front**: aplicação web (servida na porta 80)

### Portas e URLs

- **Front:** `http://localhost:80/` 
- **API:** `http://localhost:8080/`
- **Swagger:** `http://localhost:8080/swagger-ui/index.html`
- **Actuator:** `http://localhost:8080/actuator/health`
- **MinIO API:** `http://localhost:9000/`
- **MinIO Console:** `http://localhost:9090/`
- **PostgreSQL:** `localhost:5432`

---

## Como rodar

### Pré-requisitos
- Docker
- Docker Compose (plugin do Docker)

### Subir o ambiente (build + run)
Na raiz do repositório:

```bash
docker compose up --build
```

A API possui healthcheck e o front depende dela ficar saudável antes de iniciar.

### Parar containers
```bash
docker compose down
```

### Resetar dados (apaga volumes do Postgres e MinIO)
```bash
docker compose down -v
```

---

## Variáveis de ambiente

A API lê o arquivo `.env` (usado no serviço `api` do compose).

### `.env` (exemplo do projeto)

> **Importante:** evite commitar credenciais reais. Recomenda-se manter um `.env.example` no repositório com valores dummy.

```env
# ===== SERVER =====
SERVER_PORT=8080

# ===== DATABASE =====
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/meu_banco
SPRING_DATASOURCE_USERNAME=Guilherme
SPRING_DATASOURCE_PASSWORD=SENHA2026

# ===== JPA / FLYWAY =====
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_BASELINE_ON_MIGRATE=true

# ===== MINIO =====
MINIO_INTERNAL_URL=http://minio:9000
MINIO_PUBLIC_URL=http://host.docker.internal:9000

MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=admin123
MINIO_BUCKET=fotos
MINIO_REGION=us-east-1

# ===== JWT =====
JWT_SECRET="lorienepsiumsenha2026generatenewsecretekey"
JWT_ISSUER=api-artistas
JWT_ACCESS_MINUTES=5
JWT_REFRESH_DAYS=7
JWT_LOGIN_FIELD=email

# ==== Cors =====
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost

# (Front - referência local)
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

## MinIO (imagens)

O serviço `minio-init` cria automaticamente o bucket configurado em `MINIO_BUCKET` (padrão: `fotos`) quando o MinIO fica healthy.

A URL pública `MINIO_PUBLIC_URL` é usada para montar links acessíveis pelo host (ex.: `http://host.docker.internal:9000`).

---

## Health checks (Actuator)

A API expõe endpoints de saúde:

- `GET /actuator/health`
- `GET /actuator/health/liveness`
- `GET /actuator/health/readiness`

O Docker Compose valida readiness com:

- `GET /actuator/health/readiness` deve retornar `"status":"UP"`

---

## Swagger / OpenAPI

A documentação interativa está disponível em:

- `http://localhost:8080/swagger-ui/index.html`

Use o Swagger para:
- ver endpoints disponíveis
- testar requests
- copiar exemplos de payload/response

---

## Autenticação (JWT)

O projeto usa JWT com:
- **Access token:** expira em **5 minutos**
- **Refresh token:** expira em **7 dias**
- O campo de login é configurável via `JWT_LOGIN_FIELD` (padrão no projeto: `email`)

> Os endpoints exatos de autenticação estão no Swagger em `/api/v1/auth/**`.

### Como autenticar no Swagger
1. Acesse o Swagger.
2. Faça login no endpoint de auth e copie o access token retornado.
3. Clique em **Authorize** e cole como:
   - `Bearer SEU_ACCESS_TOKEN`

---

## Estrutura do repositório 

- `ApiArtistas/` – Back-end Spring Boot
- `FrontArtistas/` – Front-end React/TS

---
