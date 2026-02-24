import { requireAuth } from "@/lib/auth";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Library AI
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {session.user.email}
            </span>
            <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
              {session.user.role}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome, {session.user.name ?? session.user.email}. You are signed in
          as <strong>{session.user.role}</strong>.
        </p>
      </main>
    </div>
  );
}
