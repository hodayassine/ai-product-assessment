This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1. Copy `.env.example` to `.env` and set at least `DATABASE_URL` (and for auth, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — see Authentication below).

2. Install dependencies and generate Prisma Client:

   ```bash
   npm install
   npx prisma migrate dev
   ```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Authentication (Google SSO)

1. Install auth dependencies (if not already present):

   ```bash
   npm install next-auth@beta @auth/prisma-adapter --legacy-peer-deps
   ```

2. Set environment variables (see `.env.example`):

   - `AUTH_SECRET` — generate with `npx auth secret`
   - `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` — from [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 Client ID). Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (or your production URL).

3. Run database migrations so NextAuth tables exist:

   ```bash
   npx prisma migrate dev
   ```

4. New users get the **Member** role by default. To make the first user an Admin, update the `User` record in the database (e.g. via `npx prisma studio` or a one-off script) and set `role` to `ADMIN`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
