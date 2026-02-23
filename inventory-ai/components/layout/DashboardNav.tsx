"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function DashboardNav({ role }: { role?: string }) {
  const canEdit = role === "ADMIN" || role === "STAFF";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Dashboard
          </Link>
          {canEdit && (
            <Link
              href="/dashboard/items/new"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Add item
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <span
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
            title="Your role"
          >
            {role}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
