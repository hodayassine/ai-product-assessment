"use client";

import { useState } from "react";
import { checkout, checkin } from "@/lib/actions/borrow";
import { useRouter } from "next/navigation";
import { BookPlus, RotateCcw } from "lucide-react";

type Props = {
  bookId: string;
  userId: string;
  availableCopies: number;
  activeBorrowId: string | null;
};

export function BorrowActions({ bookId, userId, availableCopies, activeBorrowId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleBorrow() {
    setMessage(null);
    setLoading(true);
    const result = await checkout(bookId, userId);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setMessage({ type: "err", text: result.error });
    }
  }

  async function handleReturn() {
    if (!activeBorrowId) return;
    setMessage(null);
    setLoading(true);
    const result = await checkin(activeBorrowId);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      setMessage({ type: "err", text: result.error });
    }
  }

  if (activeBorrowId) {
    return (
      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-amber-700 dark:text-amber-400">You have this book checked out.</p>
        <button
          type="button"
          onClick={handleReturn}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90 disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
          {loading ? "Returning…" : "Return book"}
        </button>
        {message && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{message.text}</p>}
      </div>
    );
  }

  if (availableCopies < 1) {
    return <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No copies available. Check back later.</p>;
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleBorrow}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90 disabled:opacity-50"
      >
        <BookPlus className="h-4 w-4 shrink-0" aria-hidden />
        {loading ? "Borrowing…" : "Borrow book"}
      </button>
      {message && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{message.text}</p>}
    </div>
  );
}
