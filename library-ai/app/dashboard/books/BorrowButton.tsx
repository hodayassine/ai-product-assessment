"use client";

import { useState } from "react";
import { checkout } from "@/lib/actions/borrow";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookPlus, Check } from "lucide-react";

type Props = {
  bookId: string;
  userId: string;
  availableCopies: number;
  hasBorrowed: boolean;
};

export function BorrowButton({ bookId, userId, availableCopies, hasBorrowed }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBorrow(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setLoading(true);
    const result = await checkout(bookId, userId);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  if (hasBorrowed) {
    return (
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          You have this
        </span>
        <Link
          href={`/dashboard/books/${bookId}`}
          className="text-xs text-[hsl(var(--muted-foreground))] hover:underline"
        >
          View / Return
        </Link>
      </div>
    );
  }

  if (availableCopies < 1) {
    return (
      <span className="shrink-0 text-sm text-[hsl(var(--muted-foreground))]">
        Unavailable
      </span>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={handleBorrow}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-[hsl(var(--accent-foreground))] shadow-sm hover:opacity-90 disabled:opacity-50"
      >
        <BookPlus className="h-4 w-4 shrink-0" aria-hidden />
        {loading ? "Borrowing…" : "Borrow"}
      </button>
      {error && (
        <p className="max-w-[140px] text-right text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
