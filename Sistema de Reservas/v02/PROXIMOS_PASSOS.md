# Próximos Passos — Motéis Fortaleza v03

O projeto está 100% desenvolvido. Etapas operacionais para rodar:

## 1. Subir PostgreSQL

Opção local (Docker):
```
docker run -d --name moteis-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres
docker exec -it moteis-pg createdb -U postgres moteisfortaleza
```

Ou usar cloud: Railway, Supabase, Neon (gratuito).

## 2. Criar tabelas

```
cd apps/server
npm run db:push
```

## 3. Configurar .env

Editar `apps/server/.env`:
```
BETTER_AUTH_SECRET=<gerar chave longa aleatória>
BETTER_AUTH_URL=http://localhost:3001
TELEGRAM_BOT_TOKEN=<token do bot>
TELEGRAM_AUTHORIZED_IDS=<IDs separados por vírgula>
RESEND_API_KEY=<chave da API Resend>
```

Cada motel precisa do token ASAAS no campo `token_asaas` (via admin ou seed).

## 4. Criar 1º admin

Via rota da API ou seed manual no banco:
```
POST http://localhost:3001/api/admin/users
{
  "nome": "Admin",
  "email": "admin@moteisfortaleza.com",
  "role": "admin"
}
```

Depois registrar o mesmo email via Better Auth (`POST /api/auth/sign-up/email`).

## 5. Migrar dados do Firestore

```
cd apps/server
npx tsx src/scripts/migrate.ts
```

Variáveis de ambiente extras:
- `FIREBASE_PROJECT_ID=moteisfortaleza-9dadd`
- `FIREBASE_API_KEY=AIza...`

## 6. Deploy

- **Frontend**: Firebase Hosting (`firebase deploy`)
- **Backend**: Railway / Render / Fly.io

---

## Rotas principais

| Ambiente | URL |
|---|---|
| Cliente (chat reserva) | http://localhost:5173/reserva |
| Admin login | http://localhost:5173/admin/login |
| Admin dashboard | http://localhost:5173/admin |
| NPS público | http://localhost:5173/nps?id=motel-id |
| Links público | http://localhost:5173/links?id=motel-id |
| API health | http://localhost:3001/api/health |
