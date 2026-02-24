import { requireRole } from "@/lib/auth";
import { createBook } from "@/lib/actions/books";
import { BookForm } from "@/components/BookForm";
import Link from "next/link";

export default async function NewBookPage() {
  await requireRole(["ADMIN", "LIBRARIAN"]);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/books"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to books
        </Link>
      </div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Add book
      </h1>
      <BookForm action={createBook} submitLabel="Add book" />
    </div>
  );
}
