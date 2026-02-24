import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ItemTable } from "@/components/dashboard/ItemTable";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { getInventorySummary, suggestReorder } from "@/lib/ai";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { InventoryStatus } from "@/lib/prisma-types";
import type { ReorderSuggestion } from "@/lib/ai";

type SearchParams = { name?: string; category?: string; status?: string };

const VALID_STATUSES: InventoryStatus[] = ["InStock", "LowStock", "Ordered", "Discontinued"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const params = await searchParams;

  const where: { name?: { contains: string }; category?: string; status?: InventoryStatus } = {};
  if (params.name?.trim()) where.name = { contains: params.name.trim() };
  if (params.category?.trim()) where.category = params.category.trim();
  if (params.status?.trim() && VALID_STATUSES.includes(params.status.trim() as InventoryStatus))
    where.status = params.status.trim() as InventoryStatus;

  const [items, summary, reorderSuggestions] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    }),
    getInventorySummary(),
    suggestReorder(),
  ]);

  const canEdit = session.user.role === "ADMIN" || session.user.role === "STAFF";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage your stock</p>
        </div>
        {canEdit && (
          <Link
            href="/dashboard/items/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <Plus className="size-4" aria-hidden />
            Add item
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total items" value={summary.totalItems} />
        <SummaryCard label="In stock" value={summary.inStock} variant="success" />
        <SummaryCard label="Low stock" value={summary.lowStock} variant="warning" />
        <SummaryCard label="Ordered" value={summary.ordered} variant="info" />
      </div>

      {reorderSuggestions.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900">
            <span aria-hidden>💡</span> Reorder suggestions
          </h2>
          <ul className="space-y-2 text-sm text-amber-800">
            {reorderSuggestions.slice(0, 5).map((s: ReorderSuggestion) => (
              <li key={s.itemId} className="flex items-baseline gap-2">
                <Link
                  href={`/dashboard/items/${s.itemId}/edit`}
                  className="font-medium hover:underline"
                >
                  {s.name}
                </Link>
                <span className="text-amber-700">{s.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Filter inventory</h2>
        <SearchFilters initial={{ name: params.name, category: params.category, status: params.status }} />
      </section>

      <section>
        <h2 className="sr-only">Items list</h2>
        <ItemTable items={items} canEdit={canEdit} />
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "success" | "warning" | "info";
}) {
  const styles = {
    default: "border-slate-200 bg-white",
    success: "border-emerald-200 bg-white ring-1 ring-emerald-100",
    warning: "border-amber-200 bg-white ring-1 ring-amber-100",
    info: "border-blue-200 bg-white ring-1 ring-blue-100",
  };
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${styles[variant]}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
