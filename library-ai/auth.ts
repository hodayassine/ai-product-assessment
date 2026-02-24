import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma/client";

export type Role = "ADMIN" | "LIBRARIAN" | "MEMBER";

type JWTWithUser = {
  userId?: string;
  role?: Role;
  email?: string | null;
  name?: string | null;
  picture?: string | null;
};

const nextAuth = NextAuth as unknown as (config: any) => any;

export const { handlers, signIn, signOut, auth } = nextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, profile }: any) {
      const t = token as JWTWithUser;

      // On first sign-in with Google, ensure a User record exists and cache id/role in the token
      if (account && profile && t.email) {
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
          },
          select: { id: true, role: true },
        });

        t.userId = dbUser.id;
        t.role = dbUser.role as Role;
      } else if (!t.role && t.userId) {
        // Subsequent requests: if we somehow lost role, reload it from DB
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
