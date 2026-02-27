import { requireAuth } from "@/lib/auth";
import { signOut } from "@/auth";
import Link from "next/link";
import { BookMarked, LogOut } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export default async function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-10 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[hsl(var(--foreground))] hover:opacity-80"
          >
            <BookMarked className="h-6 w-6 shrink-0" aria-hidden />
            Library AI
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="max-w-[180px] truncate text-sm text-[hsl(var(--muted-foreground))]"
              title={session.user.email ?? ""}
            >
              {session.user.email}
            </span>
            <span className="rounded-lg bg-[hsl(var(--muted))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--foreground))]">
              {session.user.role}
            </span>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-5xl gap-10 px-4 py-8">
        <aside className="w-48 shrink-0">
          <SidebarNav role={session.user.role as "ADMIN" | "LIBRARIAN" | "MEMBER"} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
