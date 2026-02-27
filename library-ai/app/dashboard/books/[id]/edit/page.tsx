import { requireRole } from "@/lib/auth";
import { getBookById, getGenreOptions } from "@/lib/actions/books";
import { BookForm } from "@/components/BookForm";
import { updateBook } from "@/lib/actions/books";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function EditBookPage({
  params,
}: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "LIBRARIAN"]);
  const { id } = await params;
  const [result, genres] = await Promise.all([getBookById(id), getGenreOptions()]);

  if (!result.success) {
    if (result.error === "Book not found") notFound();
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        {result.error}
      </div>
    );
  }

  const book = result.data;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/dashboard/books/${book.id}`}
          className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to book
        </Link>
      </div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
        <Pencil className="h-7 w-7 shrink-0" aria-hidden />
        Edit book
      </h1>
      <BookForm
        action={updateBook}
        initial={{
          title: book.title,
          author: book.author,
          description: book.description ?? undefined,
          genre: book.genre,
          publishedYear: book.publishedYear,
          totalCopies: book.totalCopies,
          availableCopies: book.availableCopies,
        }}
        bookId={book.id}
        submitLabel="Save changes"
        genres={genres}
      />
    </div>
  );
}
