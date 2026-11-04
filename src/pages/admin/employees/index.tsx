import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/delete-dialog";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ReactNode } from "react";

import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from "./service/service";
import type { T_EMPLOYEE } from "./service/service";

const LIMIT = 10;

export default function AdminEmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_LIST, search, page],
    queryFn: () => listEmployees({ page, limit: LIMIT, search }),
  });

  if (listQuery.isLoading) return <ScreenLoader />;
  if (listQuery.isError) return <AlertHandler variant="error" />;

  const rows: T_EMPLOYEE[] = listQuery.data?.data?.data ?? [];
  const total = listQuery.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const tableHeads: T_TableHead<T_EMPLOYEE>[] = [
    { key: "employeeCode", headName: "Code", minWidth: 140 },
    { key: "firstName", headName: "Name", minWidth: 200 },
    { key: "lastName", headName: "Last Name", minWidth: 200 },
    { key: "designation", headName: "Designation", minWidth: 180 },
    { key: "role", headName: "Role", minWidth: 120, render: (e) => <Badge variant="outline">{e.role}</Badge> },
    { key: "email", headName: "Email", minWidth: 260 },
    {
      key: "isActive",
      headName: "Status",
      minWidth: 100,
      render: (e) => <Badge variant={e.isActive ? "default" : "destructive"}>{e.isActive ? "Active" : "Inactive"}</Badge>,
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Employees"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Employees", link: "/admin/employees" }]}
        createPage="/admin/employees?mode=create"
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search by name..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => { setCreateOpen(true); }}>
          New Employee
        </Button>
      </div>

      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onEdit={(emp) => `/admin/employees?mode=edit&id=${emp.id}`}
        onDelete={(emp) => { setDeleteId(emp.id); }}
        onSearch={setSearch}
        emptyTitle="No employees found."
        renderRow={(emp) => ({ email: emp.email ?? "—" } as Record<string, ReactNode>)}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search by name..."
      />

      {createOpen && <EmployeeCreateDialog mode="create" onClose={() => setCreateOpen(false)} />}
      {editId && <EmployeeEditDialog employeeId={editId} onClose={() => setEditId(null)} initialEmails={rows} />}
      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          itemId={deleteId}
          itemName="Employee"
          onDelete={deleteEmployee}
        />
      )}
    </div>
  );
}

// --- Employee Create Dialog ---
function EmployeeCreateDialog({ onClose }: { onClose: () => void }) {
  return (
    <EmployeeFormDialog mode="create" onClose={onClose} />
  );
}

// --- Employee Edit Dialog ---
function EmployeeEditDialog({ employeeId, onClose }: { employeeId: string; onClose: () => void }) {
  return (
    <EmployeeFormDialog mode="edit" employeeId={employeeId} onClose={onClose} />
  );
}

// --- Shared form dialog ---
function EmployeeFormDialog({ mode, employeeId, onClose }: { mode: "create" | "edit"; employeeId?: string; onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "TEACHER",
    designation: "Staff",
    gender: "MALE",
    phone: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "create") {
        return createEmployee(form as never);
      } else if (employeeId) {
        return updateEmployee(employeeId, form as never);
      }
    },
    onSuccess: () => {
      useAuth2().logout();
    },
    onError: () => {},
    onSettled: () => {},
  });

  const handleSubmit = async () => {
    setSubmitting(true);
    await mutation.mutateAsync();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-lg w-full rounded-lg border p-6 space-y-4">
        <h3 className="font-semibold">{mode === "create" ? "Create Employee" : "Update Employee"}</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground">First Name *</label>
          <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground">Last Name *</label>
          <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground">Email *</label>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground">Password *</label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">Role</label>
            <select
              className="rounded border px-3 py-1 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="PRINCIPAL">Principal</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="TEACHER">Teacher</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-muted-foreground">Designation</label>
            <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground">Phone</label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-muted-foreground">Gender</label>
          <select
            className="rounded border px-3 py-1 text-sm"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHERS">Others</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={submitting || !form.firstName || !form.lastName || !form.email}
            onClick={handleSubmit}>
            {submitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Tiny helper to avoid circular import issues; use the context directly
import { useAuth } from "@/auth/context/auth-context";
function useAuth2(): typeof useAuth {
  return useAuth();
}
