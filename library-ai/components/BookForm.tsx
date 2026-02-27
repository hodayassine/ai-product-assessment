"use client";

import { useState } from "react";
import type { CreateBookInput } from "@/lib/validations/book";
import { Select2, type Select2Option } from "@/components/ui/Select2";

const inputClass =
  "w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/20";
const labelClass = "mb-1.5 block text-sm font-medium text-[hsl(var(--muted-foreground))]";

type BookFormProps = {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; id?: string }>;
  initial?: Partial<CreateBookInput>;
  bookId?: string;
  submitLabel: string;
  genres?: string[];
};

const currentYear = new Date().getFullYear();

export function BookForm({ action, initial, bookId, submitLabel, genres = [] }: BookFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState(initial?.genre ?? "");

  const genreOptions: Select2Option[] = genres.length
    ? (() => {
        const list = genres.map((g) => ({ value: g, label: g }));
        if (initial?.genre && !genres.includes(initial.genre)) {
          return [{ value: initial.genre, label: initial.genre }, ...list];
        }
        return list;
      })()
    : [];

  const useGenreSelect = genreOptions.length > 0;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    if (useGenreSelect) {
      formData.set("genre", genre);
    }
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
    <form action={handleSubmit} className="flex max-w-xl flex-col gap-5">
      {bookId && <input type="hidden" name="id" value={bookId} />}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="title" className={labelClass}>Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initial?.title}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="author" className={labelClass}>Author *</label>
        <input
          id="author"
          name="author"
          type="text"
          required
          defaultValue={initial?.author}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? undefined}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="genre" className={labelClass}>Genre *</label>
        {useGenreSelect ? (
          <>
            <input type="hidden" name="genre" value={genre} />
            <Select2
              options={genreOptions}
              value={genre}
              onChange={setGenre}
              placeholder="Choose genre"
              isSearchable={genreOptions.length > 10}
              isDisabled={loading}
            />
          </>
        ) : (
          <input
            id="genre"
            name="genre"
            type="text"
            required
            defaultValue={initial?.genre}
            className={inputClass}
          />
        )}
      </div>
      <div>
        <label htmlFor="publishedYear" className={labelClass}>Published year *</label>
        <input
          id="publishedYear"
          name="publishedYear"
          type="number"
          required
          min={1}
          max={currentYear + 1}
          defaultValue={initial?.publishedYear ?? currentYear}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalCopies" className={labelClass}>Total copies *</label>
          <input
            id="totalCopies"
            name="totalCopies"
            type="number"
            required
            min={0}
            defaultValue={initial?.totalCopies ?? 1}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="availableCopies" className={labelClass}>Available copies *</label>
          <input
            id="availableCopies"
            name="availableCopies"
            type="number"
            required
            min={0}
            defaultValue={initial?.availableCopies ?? 1}
            className={inputClass}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving…" : submitLabel}
        </button>
        <a
          href={bookId ? `/dashboard/books/${bookId}` : "/dashboard/books"}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
