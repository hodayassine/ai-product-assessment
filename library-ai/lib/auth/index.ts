import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type Role = "ADMIN" | "LIBRARIAN" | "MEMBER";

/**
 * Get the current session (server-side). Returns null if not signed in.
 */
export async function getSession() {
  return auth();
}

/**
 * Require an authenticated session. Redirects to /login if not signed in.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Require one of the given roles. Redirects to /login if not signed in,
 * or to /unauthorized if signed in but lacking permission.
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  const role = session.user.role;
  if (!allowedRoles.includes(role)) {
    redirect("/unauthorized");
  }
  return session;
}

/** Role hierarchy / permission checks for use in server components and actions. */
export const ROLES: Record<Role, readonly Role[]> = {
  ADMIN: ["ADMIN", "LIBRARIAN", "MEMBER"],
  LIBRARIAN: ["LIBRARIAN", "MEMBER"],
  MEMBER: ["MEMBER"],
} as const;

export function hasRole(userRole: Role, required: Role): boolean {
  return ROLES[required].includes(userRole);
}
