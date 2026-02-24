import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <main className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Access denied
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Go to dashboard
        </Link>
      </main>
    </div>
  );
}
