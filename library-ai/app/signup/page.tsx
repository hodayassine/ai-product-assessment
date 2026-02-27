import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookMarked, ArrowLeft } from "lucide-react";
import { SignUpForm } from "./SignUpForm";

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--background))] px-4">
      <main className="w-full max-w-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-lg">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          <BookMarked className="h-6 w-6 shrink-0" aria-hidden />
          Create an account
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Sign up with email and password. First user becomes Admin.
        </p>
        <SignUpForm />
        <p className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account?{" "}
          <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-[hsl(var(--accent))] hover:opacity-90">
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
