import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ItemForm } from "@/components/dashboard/ItemForm";
import Link from "next/link";

export default async function NewItemPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/dashboard");

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
        <span className="font-medium text-slate-900">Add item</span>
      </nav>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add item</h1>
        <p className="mt-1 text-sm text-slate-500">Create a new inventory entry</p>
      </div>
      <ItemForm />
    </div>
  );
}
