"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { createItem, updateItem } from "@/app/dashboard/actions";
import type { InventoryItem } from "@prisma/client";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const STATUS_OPTIONS = [
  { value: "InStock", label: "In stock" },
  { value: "LowStock", label: "Low stock" },
  { value: "Ordered", label: "Ordered" },
  { value: "Discontinued", label: "Discontinued" },
];

export function ItemForm({ item }: { item?: InventoryItem }) {
  const [status, setStatus] = useState<string>(item?.status ?? "InStock");
  const action = item ? updateItem.bind(null, item.id) : createItem;
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await action(formData);
      if (result?.error) return result;
      return null;
    },
    null as { error?: Record<string, string[]> } | null
  );

  return (
    <form
      action={formAction}
      className="max-w-xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state?.error?._form && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.error._form[0]}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={item?.name}
            placeholder="e.g. Widget A"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 transition-colors"
          />
          {state?.error?.name && (
            <p className="mt-1 text-sm text-red-600">{state.error.name[0]}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-slate-700">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={0}
              required
              defaultValue={item?.quantity}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 transition-colors"
            />
            {state?.error?.quantity && (
              <p className="mt-1 text-sm text-red-600">{state.error.quantity[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-slate-700">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              id="category"
              name="category"
              type="text"
              required
              defaultValue={item?.category}
              placeholder="e.g. Electronics"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 transition-colors"
            />
            {state?.error?.category && (
              <p className="mt-1 text-sm text-red-600">{state.error.category[0]}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={item?.description ?? ""}
            placeholder="Optional notes"
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-slate-700">
            Status
          </label>
          <SearchableSelect
            id="status"
            name="status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            placeholder="Select status"
            aria-label="Item status"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Items with quantity ≤ 5 are auto-marked as Low stock (unless Ordered or Discontinued).
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          <Check className="size-4" aria-hidden />
          {item ? "Save changes" : "Create item"}
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Cancel
        </Link>
      </div>
    </form>
  );
}
