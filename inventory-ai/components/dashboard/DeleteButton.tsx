"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteItem } from "@/app/dashboard/actions";

export function DeleteButton({ itemId, itemName }: { itemId: string; itemName: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) return;
    startTransition(() => deleteItem(itemId));
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 className="size-3.5" aria-hidden />
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
