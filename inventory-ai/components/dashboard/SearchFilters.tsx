import { prisma } from "@/lib/prisma";
import { SearchFiltersClient } from "./SearchFiltersClient";

type Initial = { name?: string; category?: string; status?: string };

export async function SearchFilters({ initial = {} }: { initial?: Initial }) {
  const categories = await prisma.inventoryItem.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categoryList = categories.map((c) => c.category);

  return <SearchFiltersClient initial={initial} categories={categoryList} />;
}
