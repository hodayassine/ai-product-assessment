import { requireRole } from "@/lib/auth";
import { createBook, getGenreOptions } from "@/lib/actions/books";
import { BookForm } from "@/components/BookForm";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function NewBookPage() {
  await requireRole(["ADMIN", "LIBRARIAN"]);
  const genres = await getGenreOptions();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/books"
          className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to books
        </Link>
      </div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
        <Plus className="h-7 w-7 shrink-0" aria-hidden />
        Add book
      </h1>
      <BookForm action={createBook} submitLabel="Add book" genres={genres} />
    </div>
  );
}
