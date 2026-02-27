"use server";

import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type Role = "ADMIN" | "LIBRARIAN" | "MEMBER";

export type UserListItem = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
  _count: { borrowRecords: number };
};

export type UserListResult =
  | { success: true; data: UserListItem[] }
  | { success: false; error: string };

export type UserUpdateResult = { success: true } | { success: false; error: string };

export async function getUsers(): Promise<UserListResult> {
  try {
    await requireRole(["ADMIN"]);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        _count: { select: { borrowRecords: true } },
      },
    });
    return { success: true, data: users as UserListItem[] };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to list users" };
  }
}

export async function updateUserRole(userId: string, role: Role): Promise<UserUpdateResult> {
  try {
    await requireRole(["ADMIN"]);
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update role" };
  }
}
