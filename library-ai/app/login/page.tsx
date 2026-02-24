import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl ?? "/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <main className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Sign in to Library AI
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Use your Google account.
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign in with Google
          </button>
        </form>
      </main>
    </div>
  );
}
