import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";

const LIMIT = 20;

export default function PrincipalPendingResultsPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_RESULTS_PENDING, page],
    queryFn: () => fetch("/principal/results/pending").then((r) => r.json()),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PENDING_RESULT[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const approveMut = useMutation({
    mutationFn: ({ resultId }) => approveResult(resultId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_RESULTS_PENDING] }); toast.success("Result approved"); },
  });

  const rejectMut = useMutation({
    mutationFn: ({ resultId, reason }) => rejectResult(resultId, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_RESULTS_PENDING] }); toast.success("Result rejected"); },
  });

  const head: T_TableHead<T_PENDING_RESULT>[] = [
    { key: "examName", headName: "Exam", minWidth: 220 },
    { key: "batchName", headName: "Batch", minWidth: 180 },
    { key: "studentName", headName: "Student", minWidth: 220 },
    { key: "subjectName", headName: "Subject", minWidth: 180 },
    { key: "status", headName: "Status", minWidth: 160, render: (r) => <Badge variant={r.status === "APPROVED" ? "success" : "warning"}>{r.status}</Badge> },
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
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No pending results."
        renderRow={(r) => ({ examName: r.examName, batchName: r.batchName, studentName: r.studentName, subjectName: r.subjectName, status: r.status } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}

type T_PENDING_RESULT = {
  id: string;
  examName: string;
  batchName: string;
  studentName: string;
  subjectName: string;
  status: "PENDING";
};

async function approveResult(id: string) {
  await fetch(`/principal/results/${id}/approve`, { method: "POST", headers: { "Content-Type": "application/json" } });
}
async function rejectResult(id: string, reason: string) {
  await fetch(`/principal/results/${id}/reject`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` } });
}
