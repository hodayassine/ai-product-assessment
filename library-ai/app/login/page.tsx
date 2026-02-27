import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { LogIn, BookMarked } from "lucide-react";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl ?? "/dashboard");
  }

  const { registered } = await searchParams;
  const hasGoogle = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--background))] px-4">
      <main className="w-full max-w-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-lg">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          <BookMarked className="h-6 w-6 shrink-0" aria-hidden />
          Sign in to Library AI
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Sign in with your email and password, or use Google if configured.
        </p>

        <LoginForm registered={!!registered} />

        {hasGoogle && (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[hsl(var(--border))]" />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">or</span>
              <div className="h-px flex-1 bg-[hsl(var(--border))]" />
            </div>
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                Sign in with Google
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="font-medium text-[hsl(var(--accent))] hover:opacity-90">
            Create one
          </a>
        </p>
      </main>
    </div>
  );
}
