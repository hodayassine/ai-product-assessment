# Inventory AI

AI-first Inventory Management System built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, SQLite, and NextAuth.

## Features

- **Inventory CRUD**: Add, edit, and delete items (name, quantity, category, description, status)
- **Status tracking**: In stock, Low stock, Ordered, Discontinued (auto Low stock when quantity ≤ 5)
- **Search**: Filter by name, category, and status
- **Role-based access**: Admin (full access), Staff (CRUD inventory), Viewer (read-only)
- **AI placeholder**: Reorder suggestions and inventory summary in `/lib/ai.ts` (ready to plug in an LLM)

## Tech stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS
- Prisma ORM 7 + SQLite
- NextAuth (Credentials + JWT)
- Zod for validation

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

Copy the example env and set a secret for production:

```bash
cp env.example .env
```

Edit `.env`:

- `DATABASE_URL` – SQLite path (default `file:./dev.db`)
- `NEXTAUTH_SECRET` – use a random string in production (e.g. `openssl rand -base64 32`)
- `NEXTAUTH_URL` – app URL (e.g. `http://localhost:3000` for local)

### 3. Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll be redirected to login.

### Demo accounts

| Role   | Email             | Password  |
|--------|-------------------|-----------|
| Admin  | admin@example.com | admin123  |
| Staff  | staff@example.com | staff123  |
| Viewer | viewer@example.com| viewer123 |

## Scripts

- `npm run dev` – start dev server
- `npm run build` – production build
- `npm run start` – run production server
- `npm run db:generate` – generate Prisma client
- `npm run db:migrate` – run migrations
- `npm run db:seed` – seed users and sample items
- `npm run db:studio` – open Prisma Studio

## Project structure

```
/app              – routes (dashboard, login, items CRUD)
/components       – UI (dashboard, layout, providers)
/lib              – prisma, auth, ai, validations, inventory helpers
/prisma           – schema, migrations, seed
/types            – NextAuth type extensions
```

## Deploy

1. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` in your host’s environment.
2. For production, consider PostgreSQL (e.g. Vercel Postgres) and point `DATABASE_URL` to it; run migrations and seed as needed.
3. Build and start: `npm run build && npm run start`, or use your host’s Node build command.

## License

MIT
