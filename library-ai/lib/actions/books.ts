"use server";

import { prisma } from "@/lib/prisma/client";
import type { Book, Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { createBookSchema, updateBookSchema } from "@/lib/validations/book";
import { revalidatePath } from "next/cache";

export type BookListResult = { success: true; data: Book[] } | { success: false; error: string };
export type BookOneResult = { success: true; data: Book } | { success: false; error: string };
export type BookMutateResult = { success: true; id?: string } | { success: false; error: string };

export type BookSearchParams = {
  q?: string;
  genre?: string;
  available?: "yes" | "no" | "";
};

export async function getBooks(params?: BookSearchParams): Promise<BookListResult> {
  try {
    await requireRole(["ADMIN", "LIBRARIAN", "MEMBER"]);
    const where: Prisma.BookWhereInput = {};
    if (params?.q?.trim()) {
      const term = params.q.trim();
      where.OR = [
        { title: { contains: term, mode: "insensitive" } },
        { author: { contains: term, mode: "insensitive" } },
      ];
    }
    if (params?.genre?.trim()) {
      where.genre = { equals: params.genre.trim(), mode: "insensitive" };
    }
    if (params?.available === "yes") {
      where.availableCopies = { gt: 0 };
    }
    if (params?.available === "no") {
      where.availableCopies = 0;
    }
    const books = await prisma.book.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: books };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to list books" };
  }
}

/** Genres that already exist in the database (for filters). */
export async function getGenres(): Promise<string[]> {
  await requireRole(["ADMIN", "LIBRARIAN", "MEMBER"]);
  const books = await prisma.book.findMany({ select: { genre: true }, distinct: ["genre"] });
  return books.map((b) => b.genre).filter(Boolean).sort();
}

/** Full list for forms and search: predefined genres + any DB-only genres, deduplicated. */
export async function getGenreOptions(): Promise<string[]> {
  await requireRole(["ADMIN", "LIBRARIAN", "MEMBER"]);
  const { PREDEFINED_GENRES } = await import("@/lib/constants/genres");
  const dbGenres = await prisma.book
    .findMany({ select: { genre: true }, distinct: ["genre"] })
    .then((rows) => rows.map((r) => r.genre).filter(Boolean));
  const predefinedSet = new Set<string>([...PREDEFINED_GENRES]);
  const extraFromDb = dbGenres.filter((g) => !predefinedSet.has(g)).sort();
  return [...PREDEFINED_GENRES, ...extraFromDb];
}

export async function getBookById(id: string): Promise<BookOneResult> {
  try {
    await requireRole(["ADMIN", "LIBRARIAN", "MEMBER"]);
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) return { success: false, error: "Book not found" };
    return { success: true, data: book };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to get book" };
  }
}

export async function createBook(formData: FormData): Promise<BookMutateResult> {
  try {
    await requireRole(["ADMIN", "LIBRARIAN"]);
    const raw = {
      title: formData.get("title") as string,
      author: formData.get("author") as string,
      description: (formData.get("description") as string) || undefined,
      genre: formData.get("genre") as string,
      publishedYear: Number(formData.get("publishedYear")),
      totalCopies: Number(formData.get("totalCopies")),
      availableCopies: Number(formData.get("availableCopies")),
    };
    const parsed = createBookSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first).flat().join(" ") || "Validation failed";
      return { success: false, error: msg };
    }
    const book = await prisma.book.create({ data: parsed.data });
    revalidatePath("/dashboard/books");
    revalidatePath("/dashboard");
    return { success: true, id: book.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create book" };
  }
}

export async function updateBook(formData: FormData): Promise<BookMutateResult> {
  try {
    await requireRole(["ADMIN", "LIBRARIAN"]);
    const id = formData.get("id");
    if (typeof id !== "string" || !id) return { success: false, error: "Book ID is required" };
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Book not found" };

    const raw: Record<string, unknown> = {};
    const t = formData.get("title"); if (t != null) raw.title = t as string;
    const a = formData.get("author"); if (a != null) raw.author = a as string;
    const d = formData.get("description"); if (d != null) raw.description = (d as string) || undefined;
    const g = formData.get("genre"); if (g != null) raw.genre = g as string;
    const py = formData.get("publishedYear"); if (py != null) raw.publishedYear = Number(py);
    const tc = formData.get("totalCopies"); if (tc != null) raw.totalCopies = Number(tc);
    const ac = formData.get("availableCopies"); if (ac != null) raw.availableCopies = Number(ac);

    const parsed = updateBookSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first).flat().join(" ") || "Validation failed";
      return { success: false, error: msg };
    }
    await prisma.book.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/books");
    revalidatePath(`/dashboard/books/${id}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update book" };
  }
}

export async function deleteBook(id: string): Promise<BookMutateResult> {
  try {
    await requireRole(["ADMIN"]);
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Book not found" };
    await prisma.book.delete({ where: { id } });
    revalidatePath("/dashboard/books");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete book" };
  }
}
