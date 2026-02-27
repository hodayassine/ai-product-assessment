"use client";

import { useState } from "react";
import { checkin } from "@/lib/actions/borrow";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

export function ReturnButton({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReturn() {
    setLoading(true);
    const result = await checkin(recordId);
    setLoading(false);
    if (result.success) router.refresh();
    else alert(result.error);
  }

  return (
    <button
      type="button"
      onClick={handleReturn}
      disabled={loading}
      className="flex items-center gap-1.5 shrink-0 rounded-xl bg-[hsl(var(--accent))] px-3 py-2 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90 disabled:opacity-50"
    >
      <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {loading ? "Returning…" : "Return"}
    </button>
  );
}
