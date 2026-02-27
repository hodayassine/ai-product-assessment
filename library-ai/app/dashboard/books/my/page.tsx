import { requireAuth } from "@/lib/auth";
import { getMyBorrowals } from "@/lib/actions/borrow";
import Link from "next/link";
import { Library, BookOpen } from "lucide-react";
import { ReturnButton } from "./ReturnButton";

export default async function MyBooksPage() {
  const session = await requireAuth();
  const records = await getMyBorrowals(session.user.id);
  const active = records.filter((r) => !r.returnedAt);
  const returned = records.filter((r) => r.returnedAt);

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
        <Library className="h-7 w-7 shrink-0" aria-hidden />
        My books
      </h1>
      <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
        Books you have borrowed. Return from here or from the book page.
      </p>

      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Currently borrowed
          </h2>
          <ul className="space-y-3">
            {active.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
              >
                <div>
                  <Link
                    href={`/dashboard/books/${r.book.id}`}
                    className="font-medium text-[hsl(var(--foreground))] hover:underline"
                  >
                    {r.book.title}
                  </Link>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {r.book.author} · Borrowed {new Date(r.borrowedAt).toLocaleDateString()}
                  </p>
                </div>
                <ReturnButton recordId={r.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {returned.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Returned
          </h2>
          <ul className="space-y-3">
            {returned.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 opacity-75 shadow-sm"
              >
                <div>
                  <Link
                    href={`/dashboard/books/${r.book.id}`}
                    className="font-medium text-[hsl(var(--foreground))] hover:underline"
                  >
                    {r.book.title}
                  </Link>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {r.book.author} · Returned {r.returnedAt ? new Date(r.returnedAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {records.length === 0 && (
        <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-12 text-center text-[hsl(var(--muted-foreground))]">
          You haven&apos;t borrowed any books yet.{" "}
          <Link href="/dashboard/books" className="inline-flex items-center gap-1.5 font-medium text-[hsl(var(--accent))] underline hover:opacity-90">
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
            Browse books
          </Link>{" "}
          to borrow.
        </p>
      )}
    </div>
  );
}
