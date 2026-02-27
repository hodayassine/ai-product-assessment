"use client";

import { useState } from "react";
import { signUp } from "@/lib/actions/auth";
import { UserPlus, CheckCircle } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/20";
const labelClass = "mb-1.5 block text-sm font-medium text-[hsl(var(--muted-foreground))]";

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await signUp(formData);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      // Show message then redirect so user is notified
      setTimeout(() => {
        window.location.href = "/login?registered=1";
      }, 1800);
      return;
    }
    setError(result.error);
  }

  if (success) {
    return (
      <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-center dark:border-green-800 dark:bg-green-950">
        <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-600 dark:text-green-400" aria-hidden />
        <p className="font-medium text-green-800 dark:text-green-200">Account created successfully!</p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-300">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters, one letter and one number"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Min 8 characters, at least one letter and one number.
        </p>
      </div>
      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="name" className={labelClass}>
          Name <span className="text-[hsl(var(--muted-foreground))]">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90 disabled:opacity-50"
      >
        <UserPlus className="h-4 w-4 shrink-0" aria-hidden />
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
