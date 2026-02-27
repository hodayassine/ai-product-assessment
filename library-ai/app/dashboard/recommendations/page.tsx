import { requireAuth } from "@/lib/auth";
import { fetchRecommendations } from "@/lib/actions/ai";
import { prisma } from "@/lib/prisma/client";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default async function RecommendationsPage() {
  const session = await requireAuth();
  const result = await fetchRecommendations(session.user.id);

  const books =
    result.success && result.bookIds.length > 0
      ? await prisma.book.findMany({
          where: { id: { in: result.bookIds } },
          select: { id: true, title: true, author: true, genre: true },
        })
      : [];

  const ordered =
    result.success && result.bookIds.length > 0
      ? (result.bookIds.map((id) => books.find((b) => b.id === id)).filter(Boolean) as typeof books)
      : [];

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
        <Sparkles className="h-7 w-7 shrink-0" aria-hidden />
        Recommended for you
      </h1>
      <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
        Based on your borrowing history and preferred genres.
      </p>
      {!result.success ? (
        <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-8 text-center text-[hsl(var(--muted-foreground))]">
          {result.error}
        </p>
      ) : ordered.length === 0 ? (
        <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-8 text-center text-[hsl(var(--muted-foreground))]">
          No recommendations right now. Borrow some books to get personalized suggestions.
        </p>
      ) : (
        <ul className="space-y-3">
          {ordered.map((book) => (
            <li
              key={book.id}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition-shadow hover:shadow"
            >
              <Link
                href={`/dashboard/books/${book.id}`}
                className="font-medium text-[hsl(var(--foreground))] hover:underline"
              >
                {book.title}
              </Link>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {book.author} · {book.genre}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
