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

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to login.

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

### Deploy to Vercel

**Important:** SQLite does not work on Vercel (no persistent writable filesystem). Use PostgreSQL for production.

#### 1. Use a PostgreSQL database

- In the [Vercel Dashboard](https://vercel.com/dashboard), go to your project → **Storage** → **Create Database** → **Postgres**, or use [Neon](https://neon.tech), [Supabase](https://supabase.com), or any Postgres host.
- Copy the connection string (e.g. `postgresql://user:pass@host/db?sslmode=require`).

#### 2. Switch Prisma to PostgreSQL

- In `prisma/schema.prisma`, set `provider = "postgresql"` (instead of `"sqlite"`).
- For local dev you can keep SQLite; for Vercel you only need Postgres. Optionally remove `@prisma/adapter-better-sqlite3` and `better-sqlite3` from `package.json` if you use Postgres everywhere.
- Locally, set `DATABASE_URL` to your Postgres URL and run:
  - `npm run db:generate`
  - `npx prisma migrate dev` (creates migrations) then `npx prisma migrate deploy` for production.
  - `npm run db:seed`

#### 3. Push to Git and import on Vercel

- Push your code to GitHub, GitLab, or Bitbucket.
- On [vercel.com](https://vercel.com), click **Add New** → **Project** and import the repo.
- If the app is in a subfolder (e.g. `inventory-ai`), set **Root Directory** to that folder.
- Vercel will detect Next.js and use `npm run build` and `npm run start` by default.

#### 4. Set environment variables

In the project → **Settings** → **Environment Variables**, add:

| Variable           | Description |
|--------------------|-------------|
| `DATABASE_URL`     | Your Postgres connection string |
| `NEXTAUTH_SECRET`  | Random string (e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL`     | Your app URL (e.g. `https://your-app.vercel.app`) |

Apply to Production (and Preview if you want).

#### 5. Run migrations on deploy (optional)

To run migrations on each deploy, set **Build Command** to:

```bash
npx prisma generate && npx prisma migrate deploy && next build
```

Keep **Install Command** as `npm install`. Redeploy after saving env vars.

---

For other hosts: set `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL`, use PostgreSQL in production, run migrations and seed, then `npm run build && npm run start`.

## License

MIT
