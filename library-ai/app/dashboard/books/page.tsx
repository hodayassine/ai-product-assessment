import { requireAuth } from "@/lib/auth";
import { getBooks, getGenreOptions } from "@/lib/actions/books";
import type { BookSearchParams } from "@/lib/actions/books";
import { getMyBorrowals } from "@/lib/actions/borrow";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, Plus, Pencil } from "lucide-react";
import { BookSearchForm } from "./BookSearchForm";
import { BorrowButton } from "./BorrowButton";
import { DeleteInlineButton } from "./DeleteInlineButton";

type Props = { searchParams: Promise<{ q?: string; genre?: string; available?: string }> };

export default async function BooksPage({ searchParams }: Props) {
  const session = await requireAuth();
  const params = await searchParams;
  const search: BookSearchParams = {
    q: params.q ?? undefined,
    genre: params.genre ?? undefined,
    available: (params.available === "yes" || params.available === "no" ? params.available : undefined) as BookSearchParams["available"],
  };
  const [booksResult, genres, borrowals] = await Promise.all([
    getBooks(search),
    getGenreOptions(),
    getMyBorrowals(session.user.id),
  ]);
  const activeBookIds = new Set(
    borrowals.filter((r) => !r.returnedAt).map((r) => r.book.id)
  );

  if (!booksResult.success) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        {booksResult.error}
      </div>
    );
  }

  const books = booksResult.data;
  const canManage = session.user.role === "ADMIN" || session.user.role === "LIBRARIAN";
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          <BookOpen className="h-7 w-7 shrink-0" aria-hidden />
          Books
        </h1>
        {canManage && (
          <Link
            href="/dashboard/books/new"
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Add book
          </Link>
        )}
      </div>

      <Suspense fallback={<div className="mb-6 h-12 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />}>
        <BookSearchForm genres={genres} />
      </Suspense>

      {books.length === 0 ? (
        <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-12 text-center text-[hsl(var(--muted-foreground))]">
          No books match your filters.
        </p>
      ) : (
        <ul className="space-y-3">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition-shadow hover:shadow"
            >
              <div className="min-w-0">
                <Link
                  href={`/dashboard/books/${book.id}`}
                  className="font-medium text-[hsl(var(--foreground))] hover:underline"
                >
                  {book.title}
                </Link>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {book.author} · {book.genre} · {book.publishedYear}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {book.availableCopies} / {book.totalCopies} available
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <BorrowButton
                  bookId={book.id}
                  userId={session.user.id}
                  availableCopies={book.availableCopies}
                  hasBorrowed={activeBookIds.has(book.id)}
                />
                {canManage && (
                  <Link
                    href={`/dashboard/books/${book.id}/edit`}
                    className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Edit
                  </Link>
                )}
                {isAdmin && (
                  <DeleteInlineButton bookId={book.id} bookTitle={book.title} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
