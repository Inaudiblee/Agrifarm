# Agrifarm Setup Guide

## 1. Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop

## 2. Clone and Install

```bash
git clone https://github.com/ValenteGerald/Agrifarm.git
cd Agrifarm
npm install
```

## 3. Create Environment Files

```bash
copy apps\\api\\.env.example apps\\api\\.env
copy apps\\web\\.env.local.example apps\\web\\.env.local
```

## 4. Start PostgreSQL and Redis

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

## 5. Setup Prisma

```bash
npm run db:generate
npm run db:migrate
```

## 6. Run the Project

```bash
npm run dev
```

## 7. App URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api`

