# Building Store

Inventory and sales for Murakaza Neza Building Store. The frontend and backend are separate apps.

- `frontend` — Next.js shop screens
- `backend` — NestJS API and Prisma

## Local

PostgreSQL runs on this machine as user `postgres` with no password. The database name is `murakaza_store`.

```powershell
cd backend
copy .env.example .env
npm install
npx prisma migrate deploy
npm run start:dev
```

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

The shop is at http://localhost:3000 and the API is at http://localhost:3001.

Do not commit `.env` or `.env.local`. Use the example files.

## Deploy

1. Create a hosted Postgres database and copy its connection string.
2. Deploy `backend` as a web service.
   - Build: `npm install && npm run build && npx prisma migrate deploy`
   - Start: `npm run start:prod`
   - `DATABASE_URL` = hosted Postgres URL
   - `PORT` = `3001`
   - `FRONTEND_URL` = the frontend URL
3. Deploy `frontend`.
   - `NEXT_PUBLIC_API_URL` = the backend URL
4. Set `FRONTEND_URL` on the backend to that same frontend URL so the browser can call the API.
