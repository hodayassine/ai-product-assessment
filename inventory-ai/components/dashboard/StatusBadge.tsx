import type { InventoryStatus } from "@/lib/prisma-types";

const styles: Record<InventoryStatus, string> = {
  InStock: "bg-emerald-100 text-emerald-800",
  LowStock: "bg-amber-100 text-amber-800",
  Ordered: "bg-blue-100 text-blue-800",
  Discontinued: "bg-slate-200 text-slate-700",
};

const labels: Record<InventoryStatus, string> = {
  InStock: "In stock",
  LowStock: "Low stock",
  Ordered: "Ordered",
  Discontinued: "Discontinued",
};

export function StatusBadge({ status }: { status: InventoryStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
