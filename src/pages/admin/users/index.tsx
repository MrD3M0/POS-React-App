import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  deleteUser,
  listUsers,
  resetUserPassword,
  restoreUser,
  unlockUser,
  updateUser,
  type T_USER,
} from "./service/service";
import Button from "@/components/ui/button";
import { isAxiosError } from "axios";

const LIMIT = 15;

const getErrorMessage = (e: unknown): string => {
  if (isAxiosError(e)) {
    return e.response?.data?.message ?? e.message;
  }
  return e instanceof Error ? e.message : "Action failed";
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [active, setActive] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_USER_LIST, search, page, role, active],
    queryFn: () =>
      listUsers({
        page,
        limit: LIMIT,
        search: search || undefined,
        role: role || undefined,
        isActive: active === "" ? undefined : active === "true",
      }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_USER_LIST, "users"] });

  const run = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      toast.success(label);
      invalidate();
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    }
  };

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_USER[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_USER>[] = [
    { key: "email", headName: "Email", minWidth: 240 },
    { key: "username", headName: "Username", minWidth: 140, render: (r) => r.username || "—" },
    { key: "role", headName: "Role", minWidth: 120, render: (r) => <Badge variant="outline">{r.role}</Badge> },
    {
      key: "person",
      headName: "Linked person",
      minWidth: 220,
      render: (r) =>
        r.employee
          ? `${r.employee.firstName ?? ""} ${r.employee.lastName ?? ""}`.trim() + ` (${r.employee.employeeCode ?? "employee"})`
          : r.student
            ? `${r.student.firstName ?? ""} ${r.student.lastName ?? ""}`.trim() + ` (${r.student.universityRegNo ?? "student"})`
            : "—",
    },
    {
      key: "status",
      headName: "Status",
      minWidth: 180,
      render: (r) => (
        <div className="flex gap-1 flex-wrap">
          <Badge variant={r.isActive ? "default" : "secondary"}>{r.isActive ? "Active" : "Inactive"}</Badge>
          {r.lockedUntil && new Date(r.lockedUntil) > new Date() ? <Badge variant="destructive">Locked</Badge> : null}
          {!r.isEmailVerified ? <Badge variant="outline">Unverified</Badge> : null}
        </div>
      ),
    },
    {
      key: "lastLoginAt",
      headName: "Last login",
      minWidth: 180,
      render: (r) => (r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleString() : "—"),
    },
    {
      key: "actions",
      headName: "Actions",
      minWidth: 320,
      render: (r) => (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const password = window.prompt("New temporary password (min 8 chars, upper/lower/number/symbol):");
              if (!password) return;
              run("Password reset", () => resetUserPassword(r.id, password, "Admin reset"));
            }}
          >
            Reset password
          </Button>
          <Button size="sm" variant="outline" onClick={() => run("User unlocked", () => unlockUser(r.id))}>
            Unlock
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const reason = window.prompt("Reason for this change:");
              if (!reason) return;
              run(r.isActive ? "User deactivated" : "User activated", () =>
                updateUser(r.id, { isActive: !r.isActive, reason }),
              );
            }}
          >
            {r.isActive ? "Deactivate" : "Activate"}
          </Button>
          {r.deletedAt ? (
            <Button size="sm" variant="outline" onClick={() => run("User restored", () => restoreUser(r.id))}>
              Restore
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => {
              if (!window.confirm("Soft delete this user? This is blocked for linked/last-admin cases.")) return;
              run("User deleted", () => deleteUser(r.id));
            }}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Users and access"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Users", link: "/admin/users" }]}
      />
      <div className="flex gap-2 mb-4 flex-wrap">
        <select className="border rounded px-2 py-1 text-sm" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="">All roles</option>
          {["ADMIN", "PRINCIPAL", "ACCOUNTANT", "TEACHER", "STAFF", "STUDENT"].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No users found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search email or username..."
      />
    </div>
  );
}
