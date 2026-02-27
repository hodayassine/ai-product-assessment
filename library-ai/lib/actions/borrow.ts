"use server";

import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type BorrowResult = { success: true } | { success: false; error: string };

export async function checkout(bookId: string, userId: string): Promise<BorrowResult> {
  try {
    await requireRole(["ADMIN", "LIBRARIAN", "MEMBER"]);
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return { success: false, error: "Book not found" };
    if (book.availableCopies < 1) return { success: false, error: "No copies available" };

    const activeBorrow = await prisma.borrowRecord.findFirst({
      where: { userId, bookId, returnedAt: null },
    });
    if (activeBorrow) return { success: false, error: "You already have this book checked out" };

    await prisma.$transaction([
      prisma.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } },
      }),
      prisma.borrowRecord.create({
        data: { userId, bookId },
      }),
    ]);
    revalidatePath("/dashboard/books");
    revalidatePath(`/dashboard/books/${bookId}`);
    revalidatePath("/dashboard/books/my");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Check-out failed" };
  }
}

export async function checkin(recordId: string): Promise<BorrowResult> {
  try {
    const session = await requireRole(["ADMIN", "LIBRARIAN", "MEMBER"]);
    const record = await prisma.borrowRecord.findUnique({
      where: { id: recordId },
      include: { book: true },
    });
    if (!record) return { success: false, error: "Borrow record not found" };
    if (record.returnedAt) return { success: false, error: "Already returned" };
    const isLibrarianOrAdmin = session.user.role === "ADMIN" || session.user.role === "LIBRARIAN";
    if (!isLibrarianOrAdmin && record.userId !== session.user.id)
      return { success: false, error: "You can only return your own borrowals" };

    await prisma.$transaction([
      prisma.borrowRecord.update({
        where: { id: recordId },
        data: { returnedAt: new Date() },
      }),
      prisma.book.update({
        where: { id: record.bookId },
        data: { availableCopies: { increment: 1 } },
      }),
    ]);
    revalidatePath("/dashboard/books");
    revalidatePath(`/dashboard/books/${record.bookId}`);
    revalidatePath("/dashboard/books/my");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Check-in failed" };
  }
}

export async function getMyBorrowals(userId: string) {
  const records = await prisma.borrowRecord.findMany({
    where: { userId },
    orderBy: { borrowedAt: "desc" },
    include: { book: true },
  });
  return records;
}

export async function getActiveBorrowForUserAndBook(userId: string, bookId: string) {
  return prisma.borrowRecord.findFirst({
    where: { userId, bookId, returnedAt: null },
  });
}
