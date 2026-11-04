import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";

export default function TeacherResultsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: [QUERY_KEYS.TEACHER_RESULTS], queryFn: () => ({ resultsUrl: "/teacher/results" }) });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_RESULT[] = query.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader title="My Results" breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "Results", link: "/teacher/results" }]} />
      <div className="mb-4 flex flex-wrap gap-3 w-full max-w-4xl">
        <Button variant="outline" size="sm" onClick={async () => { await fetch("/teacher/results", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` } }); toast.success("New result generated"); qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_RESULTS] }); }}>Generate Result</Button>
      </div>

      <GenericTableHelper status={rows} />
    </div>
  );
}

function GenericTableHelper({ status }: { status: T_RESULT[] }) {
  const [data] = useState(status);
  const [head] = useState([
    { key: "examName", headName: "Exam", minWidth: 240 },
    { key: "batchName", headName: "Batch", minWidth: 200 },
    { key: "status", headName: "Status", minWidth: 180, render: (r: any) => <Badge variant={r.status === "APPROVED" ? "success" : r.status === "PUBLISHED" ? "default" : r.status === "REJECTED" ? "destructive" : "warning"}>{r.status}</Badge> },
    { key: "gpa", headName: "GPA", minWidth: 100 },
  ]);
  const [dataRows] = useState(data);
  const [pag, setPag] = useState({ page: 1, limit: 10, total: dataRows.length, onPageChange: () => {} });

  return <GenericTable head={head} data={dataRows} pagination={pag} emptyTitle="" />;
}

type T_RESULT = {
  id: string;
  examName: string;
  batchName: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED";
  gpa?: number;
};
