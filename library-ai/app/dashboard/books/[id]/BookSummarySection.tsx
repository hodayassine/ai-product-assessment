"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { fetchBookSummary } from "@/lib/actions/ai";

type Props = { description: string | null };

export function BookSummarySection({ description }: Props) {
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchBookSummary>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!description?.trim()) {
      setResult({ success: false, error: "No description available for this book." });
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchBookSummary(description).then((r) => {
      if (!cancelled) setResult(r);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [description]);

  if (loading) {
    return (
      <div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          AI Summary
        </h3>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Loading…</p>
      </div>
    );
  }

  if (!result?.success) {
    return (
      <div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          AI Summary
        </h3>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{result?.error ?? "Unable to load summary."}</p>
      </div>
    );
  }

  const { summary, keyThemes, idealReader } = result.data;
  return (
    <div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4">
      <h3 className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
        AI Summary
      </h3>
      <p className="mt-2 whitespace-pre-line text-sm text-[hsl(var(--foreground))]">{summary}</p>
      {keyThemes.length > 0 && (
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          <span className="font-medium">Key themes:</span> {keyThemes.join(", ")}
        </p>
      )}
      {idealReader && (
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          <span className="font-medium">Ideal reader:</span> {idealReader}
        </p>
      )}
    </div>
  );
}
