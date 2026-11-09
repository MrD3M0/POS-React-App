import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listPendingResults, approveResult, rejectResult, type T_PENDING_RESULT } from "./service/service";

const LIMIT = 20;

function getStudentName(r: T_PENDING_RESULT): string {
  if (r.studentName) return r.studentName;
  if (r.student) {
    return [r.student.firstName, r.student.middleName, r.student.lastName].filter(Boolean).join(" ") || "—";
  }
  return "—";
}

export default function PrincipalPendingResultsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_RESULTS_PENDING, page, search],
    queryFn: () => listPendingResults({ page, limit: LIMIT, search }),
  });

  const approveMut = useMutation({
    mutationFn: (resultId: string) => approveResult(resultId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_RESULTS_PENDING] }); toast.success("Result approved"); },
    onError: () => toast.error("Failed to approve result."),
  });

  const rejectMut = useMutation({
    mutationFn: (resultId: string) => rejectResult(resultId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_RESULTS_PENDING] }); toast.success("Result rejected"); },
    onError: () => toast.error("Failed to reject result."),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rawRows: T_PENDING_RESULT[] = Array.isArray(query.data?.data?.data)
    ? query.data.data.data
    : Array.isArray(query.data?.data)
      ? query.data.data
      : [];
  const total = query.data?.data?.pagination?.total ?? rawRows.length;

  const rows: T_PENDING_RESULT[] = rawRows.map((r) => ({
    ...r,
    examName: r.examName ?? r.exam?.name ?? "—",
    batchName: r.batchName ?? r.batch?.name ?? "—",
    studentName: getStudentName(r),
    subjectName: r.subjectName ?? r.subject?.name ?? "—",
  }));

  const head: T_TableHead<T_PENDING_RESULT>[] = [
    { key: "examName", headName: "Exam", minWidth: 220 },
    { key: "batchName", headName: "Batch", minWidth: 180 },
    { key: "studentName", headName: "Student", minWidth: 220 },
    { key: "subjectName", headName: "Subject", minWidth: 180 },
    { key: "status", headName: "Status", minWidth: 160, render: (r) => <Badge variant={r.status === "APPROVED" ? "success" : r.status === "REJECTED" ? "destructive" : "warning"}>{r.status}</Badge> },
    {
      key: "action",
      headName: "Action",
      minWidth: 190,
      render: (r) => (
        <div className="flex gap-2">
          <button className="text-xs font-medium text-primary underline" onClick={() => approveMut.mutate(r.id)}>Approve</button>
          <button className="text-xs font-medium text-destructive underline" disabled={rejectMut.isPending} onClick={() => rejectMut.mutate(r.id)}>Reject</button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Pending Results"
        breadCrumbItems={[{ title: "Principal", link: "/principal" }, { title: "Pending Results", link: "/principal/results/pending" }]}
      />
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search pending results..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No pending results."
        renderRow={(r) => ({ examName: r.examName ?? "—", batchName: r.batchName ?? "—", studentName: r.studentName ?? getStudentName(r), subjectName: r.subjectName ?? "—", status: r.status } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}
