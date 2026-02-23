import type { InventoryStatus } from "@/lib/prisma-types";

const LOW_STOCK_THRESHOLD = 5;

/**
 * Auto-set status to LowStock when quantity <= 5 (unless Ordered or Discontinued).
 */
export function resolveStatus(
  quantity: number,
  requestedStatus: InventoryStatus
): InventoryStatus {
  if (requestedStatus === "Ordered" || requestedStatus === "Discontinued")
    return requestedStatus;
  return quantity <= LOW_STOCK_THRESHOLD ? "LowStock" : "InStock";
}
