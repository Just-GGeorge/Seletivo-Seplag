# Projeto-pratico
 Projeto prático PROCESSO SELETIVO CONJUNTO Nº 001/2026/SEPLAG e demais Órgãos - Engenheiro da Computação- Sênior

github: https://github.com/Just-GGeorge/Seletivo-Seplag

Candidato: Guilherme George Oliveira da Silva

email: guilhermegeorge06@gmail.com

# Seletivo SEPLAG — CRUD Artistas & Álbuns (Full Stack)

Aplicação Full Stack para **cadastro e gestão de Artistas e seus Álbuns**, com **upload/armazenamento de imagens em serviço externo (MinIO/S3)**, **autenticação JWT com refresh token**, **paginação/filtros** e **migrations com Flyway**.

> Projeto organizado em **backend (Spring Boot)** + **frontend (React + TypeScript)**.

---

## ✨ Funcionalidades

### Backend
- CRUD de **Artistas**
- CRUD de **Álbuns**
- Relacionamento **N:N (muitos-para-muitos)** entre Artistas e Álbuns
- Upload/remoção/listagem de **imagens de álbum** via **MinIO (S3-compatible)**
- **URLs pré-assinadas** (presigned URLs) para acesso às imagens
- **JWT (access token)** com expiração curta + **Refresh Token**
- **Flyway** para versionamento do banco
- **Health checks** (liveness/readiness) via Actuator
- **Rate limit por usuário** (Bucket4j) configurável por variáveis de ambiente

### Frontend
- Listagem de artistas com filtros/paginação/ordenação
- Tela de detalhes do artista com listagem de álbuns
- Cards de álbum (ex.: `AlbumsCards`) com carrossel de imagens e menu de ações
- Integração com autenticação (JWT) e chamadas à API

---

## 🧱 Stack

**Backend**
- Java 17
- Spring Boot 3.2.x
- Spring Web / Spring Data JPA
- PostgreSQL
- Flyway
- JWT + Refresh Token
- MinIO (S3)

**Frontend**
- React + TypeScript
- Vite
- MUI (tema dark)
- Integração via REST

---

## 📁 Estrutura (exemplo)

```
/
├─ ApiArtistas/           # API Spring Boot
├─ FrontArtistas/         # React + TS + Vite
├─ docker-compose.yml     # Postgres + MinIO + API + Front
├─ .env                   # variáveis do backend (usado no compose)
└─ README.md
```

---

## ✅ Pré-requisitos

- **Docker** e **Docker Compose**
- (Opcional) **Java 17** e **Maven** para rodar a API fora do Docker

---


## 🚀 Como rodar com Docker (recomendado)

Na raiz do projeto:

```bash
git clone https://github.com/Just-GGeorge/Seletivo-Seplag

# 2. Suba os containers com Docker Compose
docker-compose up --build

# 2. Parar os containers com Docker Compose
docker-compose stop
```

### Acessar MinIO
- Console: `http://localhost:9090`
- API S3 (host/local): `http://localhost:9000`
- API S3 (rede Docker/interno): `http://minio:9000`

> A API retorna URLs públicas usando `MINIO_PUBLIC_URL` (no exemplo abaixo: `http://host.docker.internal:9000`).

---

## ⚙️ Variáveis de ambiente

O backend lê configurações via `application.properties` e permite sobrescrever por variáveis de ambiente (ex.: via arquivo `.env` usado no `docker-compose`).

Exemplo de `.env` (backend):

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

# ===== CORS =====
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost


(Alterar o limite de requições, necessario a reinicialização do docker) Padrão está 30 para permitir navegação inicial própria
# ===== RATE LIMIT (Bucket4j) =====
RATE_LIMIT_CAPACITY=20
RATE_LIMIT_MINUTES=1
```


---

## ▶️ Rodando o Backend (sem Docker)

Dentro da pasta `ApiArtistas/`:

```bash
./mvnw spring-boot:run
```

No Windows:

```bat
mvnw.cmd spring-boot:run
```

API: `http://localhost:8080`

---

## ▶️ Rodando o Frontend (local)

Dentro da pasta `FrontArtistas/`:

```bash
npm install
npm run dev
```

Front: `http://localhost:5173`

> Se usar `.env` do Vite, exemplo:
```env
VITE_API_URL=http://localhost:8080
```



## 🧪 Testes

Backend:
```bash
./mvnw test
```

Frontend:
```bash
npm test
```



---

## 📚 Swagger e Actuator

- Swagger UI: `http://localhost:8080/swagger-ui.html` 
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Actuator: `http://localhost:8080/actuator/health`

---


## 📡 Requisitos extras (roadmap)

- WebSocket: notificar no front quando um novo álbum for cadastrado
- Rate limit: configurável por env (**RATE_LIMIT_CAPACITY** / **RATE_LIMIT_MINUTES**) — padrão 10 req/min por usuário
- No front: padrão **Facade** + estado com **BehaviorSubject**
- Importação e sincronização de regionais a partir do endpoint:
  `https://integrador-argus-api.geia.vip/v1/regionais`
  - persistir em tabela `regional (id, nome, ativo)`
  - sincronizar:
    - novo no endpoint → inserir
    - não existe mais no endpoint → inativar
    - alterou atributo → inativar


