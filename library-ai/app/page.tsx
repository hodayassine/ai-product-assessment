import { auth } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <main className="w-full max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Library AI
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Mini Library Management System (AI-First)
        </p>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
          Next.js · TypeScript · Tailwind CSS
        </p>
        <div className="mt-8">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Go to dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
