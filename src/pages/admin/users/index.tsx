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

import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./service/service";
import type { T_EMPLOYEE } from "./service/service";

const LIMIT = 10;

export default function AdminEmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
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
    { key: "firstName", headName: "Name", minWidth: 220 },
    { key: "designation", headName: "Designation", minWidth: 180 },
    { key: "email", headName: "Email", minWidth: 260 },
    {
      key: "gender",
      headName: "Gender",
      minWidth: 90,
      render: (item) => <Badge variant="outline">{item.gender ?? "—"}</Badge>,
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
        <Button variant="outline" size="sm" onClick={() => console.log("create", {})}>
          New Employee
        </Button>
      </div>

      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onEdit={(emp) => `${"/admin/employees"}`}
        onDelete={(emp) => { setDeleteId(emp.id); }}
        onSearch={setSearch}
        emptyTitle="No employees found."
        renderRow={(emp) => ({ email: emp.email ?? "—" } as Record<string, ReactNode>)}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search by name..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          itemId={deleteId}
          onDelete={deleteEmployee}
          itemName="Employee"
        />
      )}
    </div>
  );
}
