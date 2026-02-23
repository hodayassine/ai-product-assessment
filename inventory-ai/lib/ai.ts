import { prisma } from "./prisma";
import type { InventoryStatus } from "@/lib/prisma-types";

/**
 * Placeholder AI service for inventory insights.
 * Replace with real LLM/API calls (e.g. OpenAI) for production.
 */

export interface ReorderSuggestion {
  itemId: string;
  name: string;
  quantity: number;
  category: string;
  status: InventoryStatus;
  suggestedOrderQuantity: number;
  reason: string;
}

export async function suggestReorder(): Promise<ReorderSuggestion[]> {
  const low = await prisma.inventoryItem.findMany({
    where: { status: "LowStock" },
    orderBy: { quantity: "asc" },
  });
  return low.map((item) => ({
    itemId: item.id,
    name: item.name,
    quantity: item.quantity,
    category: item.category,
    status: item.status,
    suggestedOrderQuantity: Math.max(0, 20 - item.quantity),
    reason: `Low stock (${item.quantity} units). Suggested reorder: ${Math.max(0, 20 - item.quantity)} units.`,
  }));
}

export async function getInventorySummary(): Promise<{
  totalItems: number;
  inStock: number;
  lowStock: number;
  ordered: number;
  discontinued: number;
}> {
  const [totalItems, inStock, lowStock, ordered, discontinued] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.count({ where: { status: "InStock" } }),
    prisma.inventoryItem.count({ where: { status: "LowStock" } }),
    prisma.inventoryItem.count({ where: { status: "Ordered" } }),
    prisma.inventoryItem.count({ where: { status: "Discontinued" } }),
  ]);
  return { totalItems, inStock, lowStock, ordered, discontinued };
}
