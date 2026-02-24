import { requireAuth } from "@/lib/auth";
import { getBookById } from "@/lib/actions/books";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteBookButton } from "./DeleteBookButton";

export default async function BookDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
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
  const canManage = session.user.role === "ADMIN" || session.user.role === "LIBRARIAN";
  const canDelete = session.user.role === "ADMIN";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/books"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to books
        </Link>
        {canManage && (
          <Link
            href={`/dashboard/books/${book.id}/edit`}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Edit
          </Link>
        )}
      </div>
      <div className="rounded-md border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {book.title}
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {book.author} · {book.genre} · {book.publishedYear}
        </p>
        <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
          {book.description ?? "No description."}
        </p>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          {book.availableCopies} of {book.totalCopies} copies available
        </p>
        {canDelete && (
          <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <DeleteBookButton bookId={book.id} bookTitle={book.title} />
          </div>
        )}
      </div>
    </div>
  );
}
