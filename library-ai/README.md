# Library AI

A **mini library management system** built with an AI-first approach: Next.js, TypeScript, Prisma, NextAuth (email/password + optional Google SSO), and **Groq** (free-tier AI). Roles (Admin, Librarian, Member) are enforced server-side; borrowing, search, and AI features (summary, recommendations, insights) are included.

---

## Requirements checklist

### Minimum (required)

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Book management** — Add, edit, delete books (title, author + metadata) | ✅ | Title, author, description, genre, published year, total/available copies. Full CRUD for Admin/Librarian; delete Admin only. |
| **Check-in / check-out** | ✅ | Borrow (check-out) and return (check-in) with Prisma transactions; “My books” list. |
| **AI features** | ✅ | Book summary (Groq), personalized recommendations, Admin AI insights (genres, patterns, acquisitions). |
| **Search** — Find books by title, author, other fields | ✅ | Debounced search (title/author), genre filter, availability filter. |
| **Source code + README** | ✅ | This repo and this file. |
| **Deploy + live URL** | — | Deploy to Vercel (or other); provide URL for testing. |
| **Authentication with SSO** (preferably), roles and permissions | ✅ | **Email/password** (primary) + **Google SSO** (optional). Roles: Admin, Librarian, Member. First user = Admin; role changes in Dashboard → Users. |

### Optional / extra

| Feature | Status |
|---------|--------|
| Different user roles and permissions | ✅ Admin / Librarian / Member with server-side enforcement. |
| Extra creativity | ✅ Predefined genre list, Select2-style dropdowns, icons (lucide-react), design tokens, TEST_SCENARIOS.md with example data. |

---

## Features

- **Authentication** — **Sign in with email and password** (default). Optional **Google SSO** when `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set. **Sign up** at `/signup` (first user becomes Admin). Roles: Admin, Librarian, Member; all role changes in Dashboard → Users.
- **Book management** — Full CRUD for Admin/Librarian; Zod validation, server-side checks, no negative copies. Predefined genre list + custom genres from DB.
- **Borrowing** — Check-out / check-in with Prisma transactions; duplicate active borrows prevented; “My books” list with return action.
- **Search** — Books list with debounced search (title/author), genre filter, and availability filter.
- **AI features** — Smart book summary (3-line summary, themes, ideal reader), personalized recommendations (from borrowing history and genres), and Admin-only AI insights (popular genres, borrow patterns, suggested acquisitions) using real DB data only.

---

## AI Features

- **Smart Book Summary** — On each book detail page, the app calls Groq with the book description and displays a 3-line summary, key themes, and ideal reader. JSON output is validated; failures show a fallback message.
- **Personalized Recommendations** — Dashboard → Recommendations uses the user’s borrowing history and preferred genres. The AI receives only the real book list from the database and returns book IDs; results are validated against the DB (no invented books).
- **Admin AI Insights** — Dashboard → AI Insights (Admin only) sends aggregated stats (genre counts, borrows by month, top borrowed books) to Groq and shows short insights on popular genres, borrow patterns, and suggested acquisition categories. All inputs are from the database; the AI is instructed not to invent metrics.

All AI usage is centralized in `/lib/ai/aiService.ts` (Groq API, timeout, try/catch, env-based key). Components use server actions in `/lib/actions/ai.ts`; no direct AI calls from the client.

---

## Architecture

- **`/app`** — Next.js App Router: home, login, signup, dashboard, books, recommendations, users, insights.
- **`/components`** — Shared UI (e.g. `BookForm`, `BookSearchForm`, `BorrowActions`, `BookSummarySection`, `SessionProvider`).
- **`/lib/ai`** — `aiService.ts`: Groq client, `getBookSummary`, `getRecommendations`, `getAdminInsights`.
- **`/lib/auth`** — Session helpers: `requireAuth`, `requireRole`, `hasRole`; `/lib/auth/password.ts`: bcrypt hash/verify for credential sign-in.
- **`/lib/prisma`** — Prisma client singleton.
- **`/lib/actions`** — Server actions: auth (signUp), books, borrow, users, AI.
- **`/lib/validations`** — Zod schemas (book, auth).
- **`/types`** — NextAuth module augmentation (session user role).
- **`/api`** — Only `api/auth/[...nextauth]` for Auth.js.

---

## Local setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` — PostgreSQL connection string (e.g. local or Vercel Postgres).
   - `AUTH_SECRET` — e.g. `npx auth secret`.
   - `AUTH_URL` — `http://localhost:3000` (no trailing slash).
   - **Email/password sign-in** works with only the above. No Google config required.
   - **Optional Google SSO:** `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` from [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 Client ID, Web application). Redirect URI: `http://localhost:3000/api/auth/callback/google`.
   - `GROQ_API_KEY` — for AI features (free at [console.groq.com](https://console.groq.com)).

3. **Database**

   ```bash
   npx prisma migrate dev
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use **Sign up** to create an account (first user is Admin), or **Sign in** with email/password. If Google env vars are set, “Sign in with Google” appears on the login page. Use **Dashboard → Users** to change roles.

**Troubleshooting**

- **“Unable to acquire lock at .next/dev/lock”** or **“Port 3000 is in use”**  
  1. Stop any other `npm run dev` (close the other terminal tab/window).  
  2. Optional: end Node processes (Windows: Task Manager → end “Node.js”; or `taskkill /F /IM node.exe` in a new terminal).  
  3. Delete the cache and start clean:  
     ```bash
     rmdir /s /q .next
     npm run dev
     ```  
     Or run `npm run dev:clean` (removes `.next` then starts dev).  
  4. If port 3000 is still in use, Next.js will use 3001; open http://localhost:3001 instead.
- **“Multiple lockfiles” warning** — Run `npm run dev` from the `library-ai` folder; you can ignore the warning.
- **“Groq is not configured” / GROQ_API_KEY** — Add `GROQ_API_KEY=your_key_here` to `.env` in the project root (no quotes around the key). **You must restart the dev server** after changing `.env` (stop `npm run dev`, then run it again); Next.js only reads env vars at startup.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|--------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `AUTH_SECRET` | Yes | Secret for Auth.js (e.g. `npx auth secret`). |
| `AUTH_URL` | Yes | App URL (e.g. `http://localhost:3000` or production URL). |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID. If set with `AUTH_GOOGLE_SECRET`, Google SSO is shown on login. |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret. |
| `GROQ_API_KEY` | No | Groq API key for AI features (free tier at [console.groq.com](https://console.groq.com)). |

---

## Deployment (Vercel)

1. Push the repo and import the project in Vercel.
2. Add a Postgres database (e.g. Vercel Postgres) and set `DATABASE_URL`.
3. Set env vars (at least `AUTH_SECRET`, `AUTH_URL`; optionally Google and `GROQ_API_KEY`). Use production `AUTH_URL` and add production redirect URI in Google Console if using SSO.
4. Deploy. The `postinstall` script runs `prisma generate`; run migrations (e.g. `npx prisma migrate deploy`) via the Vercel build or a one-off step.

---

## Testing

See **`TEST_SCENARIOS.md`** for step-by-step scenarios and example book data to add for testing (auth, books, borrowing, AI, users, roles).

---

## Future improvements

- Due dates and overdue reminders for borrowals.
- Pagination or infinite scroll for the books list.
- Caching or rate limiting for AI summary to reduce cost and latency.
- Optional email notifications (e.g. when a book is available or due).
- Export of borrow/return history for admins.
