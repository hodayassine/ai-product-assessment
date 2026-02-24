declare module "next-auth" {
  type Role = "ADMIN" | "LIBRARIAN" | "MEMBER";
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    userId?: string;
  }
}
