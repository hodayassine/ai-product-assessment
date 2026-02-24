"use client";

import { useState } from "react";
import type { CreateBookInput } from "@/lib/validations/book";

type BookFormProps = {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
  initial?: Partial<CreateBookInput>;
  bookId?: string;
  submitLabel: string;
};

const currentYear = new Date().getFullYear();

export function BookForm({ action, initial, bookId, submitLabel }: BookFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await action(formData);
    setLoading(false);
    if (result.success) {
      if (result.id) window.location.href = `/dashboard/books/${result.id}`;
      else window.location.href = "/dashboard/books";
      return;
    }
    setError(result.error ?? "Something went wrong");
  }

  return (
    <form action={handleSubmit} className="flex max-w-xl flex-col gap-4">
      {bookId && <input type="hidden" name="id" value={bookId} />}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initial?.title}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="author" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Author *
        </label>
        <input
          id="author"
          name="author"
          type="text"
          required
          defaultValue={initial?.author}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? undefined}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="genre" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Genre *
        </label>
        <input
          id="genre"
          name="genre"
          type="text"
          required
          defaultValue={initial?.genre}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label htmlFor="publishedYear" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Published year *
        </label>
        <input
          id="publishedYear"
          name="publishedYear"
          type="number"
          required
          min={1}
          max={currentYear + 1}
          defaultValue={initial?.publishedYear ?? currentYear}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalCopies" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Total copies *
          </label>
          <input
            id="totalCopies"
            name="totalCopies"
            type="number"
            required
            min={0}
            defaultValue={initial?.totalCopies ?? 1}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div>
          <label htmlFor="availableCopies" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Available copies *
          </label>
          <input
            id="availableCopies"
            name="availableCopies"
            type="number"
            required
            min={0}
            defaultValue={initial?.availableCopies ?? 1}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? "Saving…" : submitLabel}
        </button>
        <a
          href={bookId ? `/dashboard/books/${bookId}` : "/dashboard/books"}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
