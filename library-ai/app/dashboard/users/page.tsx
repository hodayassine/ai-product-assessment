import { requireRole } from "@/lib/auth";
import { getUsers, type Role } from "@/lib/actions/users";
import { Users } from "lucide-react";
import { UpdateRoleForm } from "./UpdateRoleForm";

export default async function UsersPage() {
  await requireRole(["ADMIN"]);
  const result = await getUsers();

  if (!result.success) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        {result.error}
      </div>
    );
  }

  const users = result.data;
  const roles: Role[] = ["ADMIN", "LIBRARIAN", "MEMBER"];

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
        <Users className="h-7 w-7 shrink-0" aria-hidden />
        Manage users
      </h1>
      <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
        Change a user&apos;s role. Only admins can access this page.
      </p>

      {users.length === 0 ? (
        <p className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-8 text-center text-[hsl(var(--muted-foreground))]">
          No users yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
            >
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  {user.name ?? "—"}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {user.email ?? "—"}
                </p>
                {user._count != null && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {user._count.borrowRecords} borrow record(s)
                  </p>
                )}
              </div>
              <UpdateRoleForm
                userId={user.id}
                currentRole={user.role as Role}
                roles={roles}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
