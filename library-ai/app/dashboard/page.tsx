import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Plus, Users, Shield } from "lucide-react";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
        <LayoutDashboard className="h-7 w-7 shrink-0" aria-hidden />
        Dashboard
      </h1>
      <p className="mb-6 text-[hsl(var(--muted-foreground))]">
        Welcome, {session.user.name ?? session.user.email}.
      </p>

      <div className="mb-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          Your role
        </h2>
        <p className="mt-1 text-lg font-medium text-[hsl(var(--foreground))]">
          {session.user.role}
        </p>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          {session.user.role === "ADMIN"
            ? "You can manage users, books, and view AI insights."
            : session.user.role === "LIBRARIAN"
              ? "You can add/edit books and handle check-in / check-out."
              : "You can view and search books, borrow, and use AI recommendations."}
        </p>
        {session.user.role === "MEMBER" && (
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            To change your role, ask an admin to update it in <strong>Dashboard → Users</strong>.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/books"
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90"
        >
          <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
          Browse books
        </Link>
        {(session.user.role === "ADMIN" || session.user.role === "LIBRARIAN") && (
          <Link
            href="/dashboard/books/new"
            className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Add book
          </Link>
        )}
        {session.user.role === "ADMIN" && (
          <Link
            href="/dashboard/users"
            className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
          >
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            Manage users
          </Link>
        )}
      </div>
    </div>
  );
}
