"use server";

import { getBookSummary, getRecommendations, getAdminInsights } from "@/lib/ai/aiService";
import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth";

export async function fetchBookSummary(description: string | null) {
  await requireRole(["ADMIN", "LIBRARIAN", "MEMBER"]);
  return getBookSummary(description ?? "");
}

export async function fetchRecommendations(userId: string) {
  await requireRole(["ADMIN", "LIBRARIAN", "MEMBER"]);
  const [books, borrowals] = await Promise.all([
    prisma.book.findMany({ select: { id: true, title: true, author: true, genre: true } }),
    prisma.borrowRecord.findMany({
      where: { userId },
      include: { book: { select: { title: true, genre: true } } },
    }),
  ]);
  const borrowedBookTitles = borrowals.map((b) => b.book.title);
  const preferredGenres = [...new Set(borrowals.map((b) => b.book.genre).filter(Boolean))];
  return getRecommendations({
    bookList: books,
    borrowedBookTitles,
    preferredGenres,
  });
}

export async function fetchAdminInsights() {
  await requireRole(["ADMIN"]);
  const [genreCounts, borrowsByMonth, topBooks] = await Promise.all([
    prisma.borrowRecord.groupBy({
      by: ["bookId"],
      _count: true,
      orderBy: { _count: { bookId: "desc" } },
      take: 20,
    }),
    prisma.borrowRecord.findMany({ select: { borrowedAt: true } }),
    prisma.borrowRecord.groupBy({
      by: ["bookId"],
      _count: true,
      orderBy: { _count: { bookId: "desc" } },
      take: 10,
    }),
  ]);

  const bookIds = await prisma.book.findMany({ select: { id: true, genre: true, title: true } });
  const bookMap = new Map(bookIds.map((b) => [b.id, b]));
  const genreCount: Record<string, number> = {};
  genreCounts.forEach((g) => {
    const book = bookMap.get(g.bookId);
    const count = typeof g._count === "number" ? g._count : (g._count as { bookId?: number }).bookId ?? 0;
    if (book?.genre) genreCount[book.genre] = (genreCount[book.genre] ?? 0) + count;
  });
  const genreCountsArr = Object.entries(genreCount).map(([genre, count]) => ({ genre, count }));

  const monthCount: Record<string, number> = {};
  borrowsByMonth.forEach((b) => {
    const m = b.borrowedAt.toISOString().slice(0, 7);
    monthCount[m] = (monthCount[m] ?? 0) + 1;
  });
  const borrowCountByMonth = Object.entries(monthCount)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topBorrowedBookTitles = topBooks
    .map((t) => bookMap.get(t.bookId)?.title)
    .filter((t): t is string => Boolean(t));

  return getAdminInsights({
    genreCounts: genreCountsArr,
    borrowCountByMonth,
    topBorrowedBookTitles,
  });
}
