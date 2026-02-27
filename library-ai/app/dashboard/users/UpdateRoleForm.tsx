"use client";

import { useState } from "react";
import { updateUserRole, type Role } from "@/lib/actions/users";
import { useRouter } from "next/navigation";
import { Select2, type Select2Option } from "@/components/ui/Select2";

const roleOptions: Select2Option[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "LIBRARIAN", label: "Librarian" },
  { value: "MEMBER", label: "Member" },
];

export function UpdateRoleForm({
  userId,
  currentRole,
  roles,
}: { userId: string; currentRole: Role; roles: Role[] }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);

  const options = roleOptions.filter((o) => roles.includes(o.value as Role));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === currentRole) return;
    setLoading(true);
    const result = await updateUserRole(userId, role);
    setLoading(false);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <div className="min-w-[200px] w-[200px]">
        <Select2
          options={options}
          value={role}
          onChange={(v) => setRole(v as Role)}
          placeholder="Role"
          isSearchable={false}
          isDisabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading || role === currentRole}
        className="rounded-xl bg-[hsl(var(--accent))] px-4 py-2 text-sm font-medium text-[hsl(var(--accent-foreground))] hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Update"}
      </button>
    </form>
  );
}
