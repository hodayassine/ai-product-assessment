import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma/client";
import { verifyPassword } from "@/lib/auth/password";

export type Role = "ADMIN" | "LIBRARIAN" | "MEMBER";

type JWTWithUser = {
  userId?: string;
  role?: Role;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  sub?: string;
};

/** User fields we need for credential authorize (password is optional on model). */
type UserWithPassword = { id: string; email: string | null; name: string | null; role: string; password: string | null };

const nextAuth = NextAuth as unknown as (config: any) => any;

export const { handlers, signIn, signOut, auth } = nextAuth({
  basePath: "/api/auth",
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || typeof credentials.password !== "string") return null;
        const email = String(credentials.email).trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, role: true, password: true } as { id: true; email: true; name: true; role: true; password: true },
        }) as UserWithPassword | null;
        if (!user?.password) return null;
        const ok = await verifyPassword(credentials.password, user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined, role: user.role };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            authorization: {
              params: { prompt: "consent", access_type: "offline" },
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, profile }: any) {
      const t = token as JWTWithUser;

      // Credentials sign-in: user id and role are on the token (from authorize return)
      if (account?.provider === "credentials" && token.sub) {
        t.userId = token.sub;
        t.role = (token.role as Role) ?? "MEMBER";
        return token;
      }

      // Google SSO: upsert user and cache id/role. First user gets ADMIN.
      if (account && profile && t.email) {
        const userCount = await prisma.user.count();
        const dbUser = await prisma.user.upsert({
          where: { email: t.email },
          update: {
            name: t.name ?? (profile as { name?: string }).name ?? undefined,
            image:
              t.picture ??
              (profile as { picture?: string }).picture ??
              undefined,
          },
          create: {
            email: t.email,
            name: t.name ?? (profile as { name?: string }).name ?? undefined,
            image:
              t.picture ??
              (profile as { picture?: string }).picture ??
              undefined,
            role: userCount === 0 ? "ADMIN" : "MEMBER",
          },
          select: { id: true, role: true },
        });

        t.userId = dbUser.id;
        t.role = dbUser.role as Role;
      } else if (!t.role && t.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: t.userId },
          select: { role: true },
        });
        t.role = (dbUser?.role as Role) ?? "MEMBER";
      }

      return token;
    },
    async session({ session, token }: any) {
      const t = token as JWTWithUser;

      if (session.user) {
        session.user.id = t.userId ?? "";
        session.user.role = t.role ?? "MEMBER";
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});
