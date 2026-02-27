"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Sparkles,
  Users,
  BarChart3,
} from "lucide-react";

type Role = "ADMIN" | "LIBRARIAN" | "MEMBER";

type SidebarNavProps = {
  role: Role;
};

function navItemIsActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();

  const baseItemClasses =
    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors";
  const inactiveClasses = "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]";
  const activeClasses =
    "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/15";

  const makeClass = (href: string) =>
    `${baseItemClasses} ${navItemIsActive(pathname, href) ? activeClasses : inactiveClasses}`;

  return (
    <nav className="flex flex-col gap-0.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-sm">
      <Link href="/dashboard" className={makeClass("/dashboard")}>
        <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
        Dashboard
      </Link>
      <Link href="/dashboard/books" className={makeClass("/dashboard/books")}>
        <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
        Books
      </Link>
      <Link href="/dashboard/books/my" className={makeClass("/dashboard/books/my")}>
        <Library className="h-4 w-4 shrink-0" aria-hidden />
        My books
      </Link>
      <Link href="/dashboard/recommendations" className={makeClass("/dashboard/recommendations")}>
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        Recommendations
      </Link>
      {role === "ADMIN" && (
        <>
          <Link href="/dashboard/users" className={makeClass("/dashboard/users")}>
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            Users
          </Link>
          <Link href="/dashboard/insights" className={makeClass("/dashboard/insights")}>
            <BarChart3 className="h-4 w-4 shrink-0" aria-hidden />
            AI Insights
          </Link>
        </>
      )}
    </nav>
  );
}

