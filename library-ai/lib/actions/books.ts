"use server";

import { prisma } from "@/lib/prisma/client";
import type { Book } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { createBookSchema, updateBookSchema } from "@/lib/validations/book";
import { revalidatePath } from "next/cache";

export type BookListResult = { success: true; data: Book[] } | { success: false; error: string };
export type BookOneResult = { success: true; data: Book } | { success: false; error: string };
export type BookMutateResult = { success: true; id?: string } | { success: false; error: string };

export async function getBooks(): Promise<BookListResult> {
  try {
    await requireRole(["ADMIN", "LIBRARIAN", "MEMBER"]);
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: books };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to list books" };
  }
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
