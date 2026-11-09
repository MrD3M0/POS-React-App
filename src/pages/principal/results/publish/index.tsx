import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listApprovedResults, publishResult, type T_APPROVED_RESULT } from "./service/service";

const LIMIT = 20;

function getStudentName(r: T_APPROVED_RESULT): string {
  if (r.studentName) return r.studentName;
  if (r.student) {
    return [r.student.firstName, r.student.middleName, r.student.lastName].filter(Boolean).join(" ") || "—";
  }
  return "—";
}

export default function PrincipalResultsPublishPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "results-publish", page, search],
    queryFn: () => listApprovedResults({ page, limit: LIMIT, search }),
  });

  const publishMut = useMutation({
    mutationFn: (id: string) => publishResult(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "results-publish"] });
      toast.success("Result published");
    },
    onError: () => toast.error("Failed to publish result."),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rawRows: T_APPROVED_RESULT[] = Array.isArray(query.data?.data?.data)
    ? query.data.data.data
    : Array.isArray(query.data?.data)
      ? query.data.data
      : [];
  const total = query.data?.data?.pagination?.total ?? rawRows.length;

  const rows: T_APPROVED_RESULT[] = rawRows.map((r) => ({
    ...r,
    examName: r.examName ?? r.exam?.name ?? "—",
    batchName: r.batchName ?? r.batch?.name ?? "—",
    studentName: getStudentName(r),
    subjectName: r.subjectName ?? r.subject?.name ?? "—",
  }));

  const head: T_TableHead<T_APPROVED_RESULT>[] = [
    { key: "examName", headName: "Exam", minWidth: 220 },
    { key: "batchName", headName: "Batch", minWidth: 180 },
    { key: "studentName", headName: "Student", minWidth: 220 },
    { key: "subjectName", headName: "Subject", minWidth: 180 },
    {
      key: "status",
      headName: "Status",
      minWidth: 150,
      render: (r) => <Badge variant={r.status === "PUBLISHED" ? "success" : "warning"}>{r.status}</Badge>,
    },
    {
      key: "action",
      headName: "Action",
      minWidth: 150,
      render: (r) => (
        <button
          className="text-xs font-medium text-primary underline"
          disabled={publishMut.isPending}
          onClick={() => publishMut.mutate(r.id)}
        >
          Publish
        </button>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Publish Results"
        breadCrumbItems={[
          { title: "Principal", link: "/principal/results/publish" },
          { title: "Publish Results", link: "/principal/results/publish" },
        ]}
      />
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search results to publish..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No approved results awaiting publish."
        renderRow={(r) => ({
          examName: r.examName ?? "—",
          batchName: r.batchName ?? "—",
          studentName: r.studentName ?? getStudentName(r),
          subjectName: r.subjectName ?? "—",
        } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}
