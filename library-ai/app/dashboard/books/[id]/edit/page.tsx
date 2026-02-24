import { requireRole } from "@/lib/auth";
import { getBookById } from "@/lib/actions/books";
import { BookForm } from "@/components/BookForm";
import { updateBook } from "@/lib/actions/books";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditBookPage({
  params,
}: { params: Promise<{ id: string }> }) {
  await requireRole(["ADMIN", "LIBRARIAN"]);
  const { id } = await params;
  const result = await getBookById(id);

  if (!result.success) {
    if (result.error === "Book not found") notFound();
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
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
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to book
        </Link>
      </div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
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
      />
    </div>
  );
}
