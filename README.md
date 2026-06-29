# Agrifarm

Agrifarm is a marketplace app with a Next.js frontend, a NestJS API, PostgreSQL, and Redis.

## Language Stack

Frontend:

- Next.js 16 (`next` `^16.2.6`)
- React 19 (`react` `^19.2.6`)
- Tailwind CSS 4 (`tailwindcss` `^4.2.4`)
- Socket.IO client 4 (`socket.io-client` `^4.8.3`)

Backend:

- NestJS 11 (`@nestjs/*` `^11.x`)
- Node.js
- Socket.IO 4 / Nest WebSockets (`socket.io` `^4.8.3`)
- Prisma ORM 6 (`prisma` and `@prisma/client` `^6.14.0`)
- BullMQ 5 for queues (`bullmq` `^5.76.6`)
- ioredis 5 for Redis access (`ioredis` `^5.10.1`)

Database / Infrastructure:

- PostgreSQL 16 (`postgres:16-alpine`)
- Redis 7 (`redis:7-alpine`)
- Docker Compose for local services

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop

## How to Run

1. Clone and install dependencies.

```bash
git clone https://github.com/ValenteGerald/Agrifarm.git
cd Agrifarm
npm install
```

2. Create environment files.

```bash
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.local.example apps\web\.env.local
```

The Docker quick-start uses the database credentials from `apps\api\.env.example`. If you already have `apps\api\.env`, make sure its `DATABASE_URL` matches your local PostgreSQL container.

3. Start PostgreSQL and Redis.

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

Wait until both containers report `healthy` before running migrations:

```bash
docker compose -f infra/docker/docker-compose.yml ps
```

This Compose setup runs the local PostgreSQL and Redis dependencies. The web and API apps run through Node.js with `npm run dev`.

4. Set up Prisma.

```bash
npm run db:generate
npm run db:migrate
```

5. Optional: seed sample data.

```bash
npm run db:seed
```

6. Run the project.

```bash
npm run dev
```

## App URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api`
- API Docs UI: `http://localhost:4000/api/docs`
- OpenAPI JSON: `http://localhost:4000/api/docs/openapi.json`
- Health Check: `http://localhost:4000/api/health`

## More Documentation

- [API reference](docs/API.md)
- [QA and security notes](docs/QA.md)
