import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import GenericTable from "@/components/generic-table";
import SelectCommand from "@/components/select-command";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listBatches } from "@/pages/admin/batches/service/service";
import { listStudentsForTeacher, type T_STUDENT, type T_STUDENT_APPROVAL } from "./service/service";

const LIMIT = 20;

export default function TeacherStudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [batchId, setBatchId] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<T_STUDENT_APPROVAL | "">("");
  const navigate = useNavigate();

  const batchesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, "teacher-student-filter", "unlimited"],
    queryFn: () => listBatches({ page: 1, limit: 999 }),
  });

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_STUDENTS, page, search, batchId, approvalStatus],
    queryFn: () =>
      listStudentsForTeacher({
        page,
        limit: LIMIT,
        search,
        ...(batchId ? { batchId } : {}),
        ...(approvalStatus ? { approvalStatus } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const raw = query.data as unknown as {
    data?: T_STUDENT[] | { data?: T_STUDENT[]; pagination?: { total?: number } };
  };
  const rows: T_STUDENT[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.data?.data)
      ? raw.data.data
      : [];
  const total: number = Number((!Array.isArray(raw?.data) ? raw?.data?.pagination?.total : undefined)) || rows.length;
  const batches = batchesQuery.data?.data?.data ?? [];
  const batchOptions = [
    { label: "All batches", value: "" },
    ...batches.map((b) => ({ label: b.name || b.id, value: b.id, searchValues: `${b.name ?? ""} ${b.batchYear ?? ""}` })),
  ];
  const approvalOptions = [
    { label: "All approvals", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="My Students"
        description="Search and filter students by batch and approval status."
        breadCrumbItems={[{ title: "Teacher", link: "/teacher/my-classes" }, { title: "Students", link: "/teacher/students" }]}
        createPage="/teacher/students/add"
        createPageTitle="Add Student"
        actions={
          <div className="flex min-w-[320px] flex-wrap gap-2">
            <div className="min-w-[180px] flex-1">
              <SelectCommand
                value={batchId}
                onChange={(v) => { setBatchId(v ?? ""); setPage(1); }}
                options={batchOptions}
                placeholder={batchesQuery.isLoading ? "Loading batches..." : "All batches"}
                searchPlaceholder="Search batches..."
                loading={batchesQuery.isLoading}
                isClearable
              />
            </div>
            <div className="min-w-[160px]">
              <SelectCommand
                value={approvalStatus}
                onChange={(v) => { setApprovalStatus((v ?? "") as T_STUDENT_APPROVAL | ""); setPage(1); }}
                options={approvalOptions}
                placeholder="All approvals"
                hideSearch
              />
            </div>
          </div>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3 w-full max-w-4xl">
        <Button variant="outline" size="sm" onClick={() => navigate("/teacher/students/add")}>
          Add Student
        </Button>
      </div>

      <GenericTable
        tableHeads={[
          { key: "universityRegNo", headName: "Reg No", minWidth: 160, render: (s: T_STUDENT) => s.universityRegNo ?? "—" },
          {
            key: "firstName",
            headName: "Name",
            minWidth: 220,
            render: (s: T_STUDENT) => [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || "—",
          },
          {
            key: "approvalStatus",
            headName: "Approval",
            minWidth: 160,
            render: (s: T_STUDENT) => (
              <Badge
                variant={
                  s.approvalStatus === "APPROVED"
                    ? "success"
                    : s.approvalStatus === "REJECTED"
                      ? "destructive"
                      : "warning"
                }
              >
                {s.approvalStatus}
              </Badge>
            ),
          },
          { key: "rejectionReason", headName: "Rejection", minWidth: 200, render: (s: T_STUDENT) => s.rejectionReason ?? "—" },
        ]}
        data={rows}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name or reg no..."
        emptyTitle="No students found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        onEdit={(s) => `/teacher/students/edit/${s.id}`}
        renderActions={(s) => (
          <a href={`/teacher/students/${s.id}/id-card`} className="px-2 text-xs font-medium text-primary underline">
            ID Card
          </a>
        )}
      />
    </div>
  );
}
