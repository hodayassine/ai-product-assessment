"use client";

import { useState } from "react";
import { deleteBook } from "@/lib/actions/books";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";

export function DeleteBookButton({
  bookId,
  bookTitle,
}: { bookId: string; bookTitle: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteBook(bookId);
    setLoading(false);
    if (result.success) {
      router.push("/dashboard/books");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
      >
        <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
        Delete book
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        Delete &quot;{bookTitle}&quot;?
      </span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Deleting…" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
      >
        <X className="h-4 w-4 shrink-0" aria-hidden />
        Cancel
      </button>
    </div>
  );
}
