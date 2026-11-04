import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ReactNode } from "react";

import {
  listStudents,
  updateStudentStatus,
  approveStudent,
  rejectStudent,
  deleteStudent,
} from "./service/service";
import type { T_STUDENT } from "./service/service";

const LIMIT = 10;

export default function AdminStudentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_STUDENT_LIST, statusFilter, search, page],
    queryFn: () =>
      listStudents({ page, limit: LIMIT, search, status: statusFilter ? { equals: statusFilter } : undefined }),
  });

  if (listQuery.isLoading) return <ScreenLoader />;
  if (listQuery.isError) return <AlertHandler variant="error" />;

  const rows: T_STUDENT[] = listQuery.data?.data?.data ?? [];
  const total = listQuery.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const tableHeads: T_TableHead<T_STUDENT>[] = [
    { key: "studentCode", headName: "Code", minWidth: 100 },
    { key: "firstName", headName: "First Name", minWidth: 150 },
    { key: "middleName", headName: "Middle Name", minWidth: 120 },
    { key: "lastName", headName: "Last Name", minWidth: 150 },
    { key: "email", headName: "Email", minWidth: 200 },
    { key: "phone", headName: "Phone", minWidth: 130 },
    { key: "gender", headName: "Gender", minWidth: 80, render: (i) => <Badge>{i.gender}</Badge> },
    { key: "universityRegNo", headName: "Reg No.", minWidth: 120 },
    { key: "batchId", headName: "Batch", minWidth: 120 },
    { key: "status", headName: "Status", minWidth: 100 },
    { key: "actions", headName: "", render: () => <span className="text-xs uppercase text-muted-foreground">Actions</span> },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Students"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Students", link: "/admin/students" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => console.log("create", {})}>New Student</Button>
        <select
          className="border rounded px-2 py-1 text-sm bg-background"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="GRADUATED">Graduated</option>
          <option value="DROPPED">Dropped</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>
      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onEdit={(s) => `/admin/students?id=${s.id}`}
        onDelete={(s) => setDeleteId(s.id)}
        onSearch={setSearch}
        emptyTitle="No students found."
        renderRow={(s) => ({
          firstName: `${s.firstName} ${s.lastName}`,
          middleName: s.middleName ?? "—",
          email: s.email ?? "—",
          status: <Badge variant={s.status === "PENDING" ? "destructive" : "default"}>{s.status}</Badge>,
        } as Record<string, ReactNode>)}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
      />
      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          itemId={deleteId}
          onDelete={deleteStudent}
          itemName="Student"
        />
      )}
    </div>
  );
}

import { Input } from "@/components/ui/input";
