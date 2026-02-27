import { requireAuth } from "@/lib/auth";
import { getBookById } from "@/lib/actions/books";
import { getActiveBorrowForUserAndBook } from "@/lib/actions/borrow";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, BookOpen } from "lucide-react";
import { DeleteBookButton } from "./DeleteBookButton";
import { BorrowActions } from "./BorrowActions";
import { BookSummarySection } from "./BookSummarySection";

export default async function BookDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  const result = await getBookById(id);

  if (!result.success) {
    if (result.error === "Book not found") notFound();
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        {result.error}
      </div>
    );
  }

  const book = result.data;
  const canManage = session.user.role === "ADMIN" || session.user.role === "LIBRARIAN";
  const canDelete = session.user.role === "ADMIN";
  const activeBorrow = await getActiveBorrowForUserAndBook(session.user.id, book.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/books"
          className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to books
        </Link>
        {canManage && (
          <Link
            href={`/dashboard/books/${book.id}/edit`}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90"
          >
            <Pencil className="h-4 w-4 shrink-0" aria-hidden />
            Edit
          </Link>
        )}
      </div>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          <BookOpen className="h-7 w-7 shrink-0 text-[hsl(var(--muted-foreground))]" aria-hidden />
          {book.title}
        </h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          {book.author} · {book.genre} · {book.publishedYear}
        </p>
        <p className="mt-4 text-sm text-[hsl(var(--foreground))]">
          {book.description ?? "No description."}
        </p>
        <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
          {book.availableCopies} of {book.totalCopies} copies available
        </p>
        <BorrowActions
          bookId={book.id}
          userId={session.user.id}
          availableCopies={book.availableCopies}
          activeBorrowId={activeBorrow?.id ?? null}
        />
        <BookSummarySection description={book.description} />
        {canDelete && (
          <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
            <DeleteBookButton bookId={book.id} bookTitle={book.title} />
          </div>
        )}
      </div>
    </div>
  );
}
