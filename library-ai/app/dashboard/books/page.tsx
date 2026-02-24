import { requireAuth } from "@/lib/auth";
import { getBooks } from "@/lib/actions/books";
import Link from "next/link";

export default async function BooksPage() {
  const session = await requireAuth();
  const result = await getBooks();

  if (!result.success) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        {result.error}
      </div>
    );
  }

  const books = result.data;
  const canManage = session.user.role === "ADMIN" || session.user.role === "LIBRARIAN";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Books
        </h1>
        {canManage && (
          <Link
            href="/dashboard/books/new"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add book
          </Link>
        )}
      </div>

      {books.length === 0 ? (
        <p className="rounded-md border border-zinc-200 bg-zinc-100 py-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          No books yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="min-w-0">
                <Link
                  href={`/dashboard/books/${book.id}`}
                  className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
                >
                  {book.title}
                </Link>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {book.author} · {book.genre} · {book.publishedYear}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  {book.availableCopies} / {book.totalCopies} available
                </p>
              </div>
              {canManage && (
                <Link
                  href={`/dashboard/books/${book.id}/edit`}
                  className="shrink-0 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Edit
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
