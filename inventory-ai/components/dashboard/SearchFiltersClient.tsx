"use client";

import { useState } from "react";
import { SearchableSelect, type SelectOption } from "@/components/ui/SearchableSelect";

const STATUS_OPTIONS: SelectOption[] = [
  { value: "", label: "All statuses" },
  { value: "InStock", label: "In stock" },
  { value: "LowStock", label: "Low stock" },
  { value: "Ordered", label: "Ordered" },
  { value: "Discontinued", label: "Discontinued" },
];

type Initial = { name?: string; category?: string; status?: string };

type SearchFiltersClientProps = {
  initial?: Initial;
  categories: string[];
};

export function SearchFiltersClient({ initial = {}, categories }: SearchFiltersClientProps) {
  const [category, setCategory] = useState(initial.category ?? "");
  const [status, setStatus] = useState(initial.status ?? "");

  const categoryOptions: SelectOption[] = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <form
      method="get"
      className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="min-w-[180px] flex-1">
        <label htmlFor="search-name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="search-name"
          name="name"
          type="search"
          defaultValue={initial.name}
          placeholder="Search by name"
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 transition-colors"
        />
      </div>
      <div className="min-w-[200px]">
        <label htmlFor="search-category" className="mb-1.5 block text-sm font-medium text-slate-700">
          Category
        </label>
        <SearchableSelect
          id="search-category"
          name="category"
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          placeholder="All categories"
          allowClear
          aria-label="Filter by category"
        />
      </div>
      <div className="min-w-[200px]">
        <label htmlFor="search-status" className="mb-1.5 block text-sm font-medium text-slate-700">
          Status
        </label>
        <SearchableSelect
          id="search-status"
          name="status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
          placeholder="All statuses"
          allowClear
          aria-label="Filter by status"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
      >
        Search
      </button>
    </form>
  );
}
