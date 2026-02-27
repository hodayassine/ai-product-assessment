"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import { Select2, type Select2Option } from "@/components/ui/Select2";

const DEBOUNCE_MS = 300;

type Props = { genres: string[] };

const availabilityOptions: Select2Option[] = [
  { value: "", label: "Any availability" },
  { value: "yes", label: "Available now" },
  { value: "no", label: "Checked out" },
];

export function BookSearchForm({ genres }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const spQ = searchParams.get("q") ?? "";
  const spGenre = searchParams.get("genre") ?? "";
  const spAvailable = searchParams.get("available") ?? "";

  const [q, setQ] = useState(spQ);
  const [genre, setGenre] = useState(spGenre);
  const [available, setAvailable] = useState(spAvailable);

  // Keep local state in sync when the URL query changes (e.g. after Clear filters)
  useEffect(() => {
    setQ(spQ);
    setGenre(spGenre);
    setAvailable(spAvailable);
  }, [spQ, spGenre, spAvailable]);

  const genreOptions: Select2Option[] = [
    { value: "", label: "All genres" },
    ...genres.map((g) => ({ value: g, label: g })),
  ];
  const availableOptionsWithValue = availabilityOptions;

  const updateUrl = useCallback(
    (updates: { q?: string; genre?: string; available?: string }) => {
      const current = searchParams.toString();
      const params = new URLSearchParams(current);
      if (updates.q !== undefined) {
        const v = (updates.q ?? "").trim();
        v ? params.set("q", v) : params.delete("q");
      }
      if (updates.genre !== undefined) {
        const v = (updates.genre ?? "").trim();
        v ? params.set("genre", v) : params.delete("genre");
      }
      if (updates.available !== undefined) {
        const v = (updates.available ?? "").trim();
        v ? params.set("available", v) : params.delete("available");
      }
      const query = params.toString();
      if (query === current) return; // avoid pushing same URL repeatedly
      router.push(query ? `/dashboard/books?${query}` : "/dashboard/books", { scroll: false });
    },
    [router, searchParams]
  );

  const hasFilters =
    !!q.trim() || !!genre || !!available;

  useEffect(() => {
    // Only sync URL when local search text differs from current query param
    if (q.trim() === spQ) return;
    const t = setTimeout(() => updateUrl({ q }), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [q, spQ, updateUrl]);

  return (
    <form className="mb-8 flex flex-wrap items-end gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="min-w-[220px] flex-1">
        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          <Search className="h-4 w-4 shrink-0" aria-hidden />
          Search
        </label>
        <input
          type="search"
          placeholder="Title or author…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]/20"
        />
      </div>
      <div className="w-[200px]">
        <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--muted-foreground))]">Genre</label>
        <Select2
          options={genreOptions}
          value={genre}
          onChange={(v) => { setGenre(v); updateUrl({ genre: v || undefined }); }}
          placeholder="All genres"
          isSearchable={genres.length > 8}
        />
      </div>
      <div className="w-[180px]">
        <label className="mb-1.5 block text-sm font-medium text-[hsl(var(--muted-foreground))]">Availability</label>
        <Select2
          options={availableOptionsWithValue}
          value={available}
          onChange={(v) => { setAvailable(v); updateUrl({ available: v || undefined }); }}
          placeholder="Any"
          isSearchable={false}
        />
      </div>
      {hasFilters && (
        <div className="ml-auto">
          <Link
            href="/dashboard/books"
            className="text-xs font-medium text-[hsl(var(--muted-foreground))] underline-offset-2 hover:text-[hsl(var(--foreground))] hover:underline"
          >
            Clear filters
          </Link>
        </div>
      )}
    </form>
  );
}
