import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ItemForm } from "@/components/dashboard/ItemForm";
import Link from "next/link";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/dashboard");

  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-slate-500 transition hover:text-slate-900"
        >
          Dashboard
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-medium text-slate-900">Edit {item.name}</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit {item.name}</h1>
        <p className="mt-1 text-sm text-slate-500">Update quantity, status, or details</p>
      </div>
      <ItemForm item={item} />
    </div>
  );
}
