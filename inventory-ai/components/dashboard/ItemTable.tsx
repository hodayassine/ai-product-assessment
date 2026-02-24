import Link from "next/link";
import { Pencil } from "lucide-react";
import type { InventoryItem } from "@prisma/client";
import { DeleteButton } from "./DeleteButton";
import { StatusBadge } from "./StatusBadge";

export function ItemTable({
  items,
  canEdit,
}: {
  items: InventoryItem[];
  canEdit: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-slate-500">No items match your filters.</p>
        <p className="mt-1 text-sm text-slate-400">Try adjusting the search or add a new item.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Name
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Quantity
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Category
            </th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Status
            </th>
            {canEdit && (
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/50"
            >
              <td className="px-5 py-3.5">
                {canEdit ? (
                  <Link
                    href={`/dashboard/items/${item.id}/edit`}
                    className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-900">{item.name}</span>
                )}
              </td>
              <td className="px-5 py-3.5 tabular-nums text-slate-600">{item.quantity}</td>
              <td className="px-5 py-3.5 text-slate-600">{item.category}</td>
              <td className="px-5 py-3.5">
                <StatusBadge status={item.status} />
              </td>
              {canEdit && (
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/items/${item.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Edit
                    </Link>
                    <DeleteButton itemId={item.id} itemName={item.name} />
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
