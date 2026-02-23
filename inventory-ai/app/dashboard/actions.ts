"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createItemSchema, updateItemSchema } from "@/lib/validations";
import { resolveStatus } from "@/lib/inventory";
import type { InventoryStatus } from "@/lib/prisma-types";

function canEdit() {
  return auth().then((s) => {
    const role = s?.user?.role;
    if (role !== "ADMIN" && role !== "STAFF") throw new Error("Forbidden");
    return s!;
  });
}

export async function createItem(formData: FormData) {
  await canEdit();
  const raw = Object.fromEntries(formData.entries());
  const parsed = createItemSchema.safeParse({
    name: raw.name,
    quantity: raw.quantity,
    category: raw.category,
    description: raw.description || undefined,
    status: raw.status || "InStock",
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const { name, quantity, category, description, status } = parsed.data;
  const finalStatus = resolveStatus(quantity, status as InventoryStatus);
  await prisma.inventoryItem.create({
    data: { name, quantity, category, description, status: finalStatus },
  });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateItem(id: string, formData: FormData) {
  await canEdit();
  const raw = Object.fromEntries(formData.entries());
  const parsed = updateItemSchema.safeParse({
    name: raw.name,
    quantity: raw.quantity,
    category: raw.category,
    description: raw.description || undefined,
    status: raw.status || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const existing = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!existing) return { error: { _form: ["Item not found"] } };
  const quantity = data.quantity ?? existing.quantity;
  const status = (data.status as InventoryStatus | undefined) ?? existing.status;
  const finalStatus = resolveStatus(quantity, status);
  await prisma.inventoryItem.update({
    where: { id },
    data: {
      ...(data.name != null && { name: data.name }),
      ...(data.quantity != null && { quantity: data.quantity }),
      ...(data.category != null && { category: data.category }),
      ...(data.description !== undefined && { description: data.description || null }),
      status: finalStatus,
    },
  });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteItem(id: string) {
  await canEdit();
  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
