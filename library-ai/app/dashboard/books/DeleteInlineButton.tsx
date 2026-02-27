"use client";

import { useState } from "react";
import { deleteBook } from "@/lib/actions/books";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Props = {
  bookId: string;
  bookTitle: string;
};

export function DeleteInlineButton({ bookId, bookTitle }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${bookTitle}"? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deleteBook(bookId);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
    >
      <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}

