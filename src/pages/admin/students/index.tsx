import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import SelectCommand from "@/components/select-command";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ReactNode } from "react";
import {
  listStudents,
  deleteStudent,
  type T_STUDENT,
  type T_STUDENT_STATUS,
  type T_STUDENT_APPROVAL,
} from "./service/service";

const LIMIT = 10;

export default function AdminStudentsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_STUDENT_LIST, statusFilter, approvalFilter, search, page],
    queryFn: () =>
      listStudents({
        page,
        limit: LIMIT,
        search,
        ...(statusFilter ? { status: statusFilter as T_STUDENT_STATUS } : {}),
        ...(approvalFilter ? { approvalStatus: approvalFilter as T_STUDENT_APPROVAL } : {}),
      }),
  });

  if (listQuery.isLoading) return <ScreenLoader />;
  if (listQuery.isError) return <AlertHandler variant="error" />;

  const rows: T_STUDENT[] = listQuery.data?.data?.data ?? [];
  const total = listQuery.data?.data?.pagination?.total ?? 0;

  const tableHeads: T_TableHead<T_STUDENT>[] = [
    { key: "universityRegNo", headName: "Reg. No." },
    {
      key: "firstName",
      headName: "Name",
      render: (s) => [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || "—",
    },
    {
      key: "batchId",
      headName: "Batch",
      render: (s) => (s.batch ? `${s.batch.name} (${s.batch.course?.code ?? ""})` : s.batchId ?? "—"),
    },
    { key: "phone", headName: "Phone" },
    { key: "email", headName: "Email" },
    { key: "gender", headName: "Gender", render: (i) => <Badge variant="outline">{i.gender}</Badge> },
    {
      key: "status",
      headName: "Status",
      render: (s) => (
        <Badge
          variant={
            s.status === "ACTIVE"
              ? "default"
              : s.status === "GRADUATED"
              ? "secondary"
              : "destructive"
          }
        >
          {s.status}
        </Badge>
      ),
    },
    {
      key: "approvalStatus",
      headName: "Approval",
      render: (s) => (
        <Badge
          variant={
            s.approvalStatus === "APPROVED"
              ? "default"
              : s.approvalStatus === "REJECTED"
              ? "destructive"
              : "outline"
          }
        >
          {s.approvalStatus}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Students"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Students", link: "/admin/students" }]}
        createPage="/admin/students/create"
        createPageTitle="New Student"
        actions={
          <div className="flex min-w-[320px] flex-wrap gap-2">
            <div className="min-w-[150px]">
              <SelectCommand
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v ?? ""); setPage(1); }}
                options={[
                  { label: "All Statuses", value: "" },
                  { label: "Active", value: "ACTIVE" },
                  { label: "Graduated", value: "GRADUATED" },
                  { label: "Dropped", value: "DROPPED" },
                  { label: "Suspended", value: "SUSPENDED" },
                ]}
                placeholder="All Statuses"
                hideSearch
              />
            </div>
            <div className="min-w-[150px]">
              <SelectCommand
                value={approvalFilter}
                onChange={(v) => { setApprovalFilter(v ?? ""); setPage(1); }}
                options={[
                  { label: "All Approvals", value: "" },
                  { label: "Pending", value: "PENDING" },
                  { label: "Approved", value: "APPROVED" },
                  { label: "Rejected", value: "REJECTED" },
                ]}
                placeholder="All Approvals"
                hideSearch
              />
            </div>
          </div>
        }
      />
      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onEdit={(s) => `/admin/students/edit/${s.id}`}
        onDelete={(s) => setDeleteId(s.id)}
        renderActions={(s) => (
          <a href={`/admin/students/${s.id}/id-card`} className="px-2 text-xs font-medium text-primary underline">
            ID Card
          </a>
        )}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        emptyTitle="No students found."
        renderRow={(s) =>
          ({
            email: s.email ?? "—",
            phone: s.phone ?? "—",
          } as Record<string, ReactNode>)
        }
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search by name, reg no or email..."
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
