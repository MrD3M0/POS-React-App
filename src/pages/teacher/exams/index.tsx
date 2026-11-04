import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import QUERY_KEYS from "@/lib/query-keys";

const LIMIT = 20;

export default function TeacherExamsPage() {
  const [mode, setMode] = useState<"list" | "create">("list");
  const [examName, setExamName] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAMS],
    queryFn: () => ({ examsUrl: "/teacher/exams" }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Exams"
        breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "Exams", link: "/teacher/exams" }]}
      />
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <button onClick={() => setMode("list")} className={`rounded px-3 py-1 text-sm font-medium ${mode === "list" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>List</button>
          <button onClick={() => setMode("create")} className={`rounded px-3 py-1 text-sm font-medium ${mode === "create" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Create Exam</button>
        </div>
      </div>

      {mode === "list" && (
        <GenericTable
          tableHeads={[
            { key: "examName", headName: "Exam Name", minWidth: 240 },
            { key: "termNumber", headName: "Term", minWidth: 100 },
            { key: "subjectCode", headName: "Subject Code", minWidth: 180 },
            { key: "createdAt", headName: "Created At", minWidth: 180 },
          ]}
          data={[]}
          emptyTitle="No exams yet."
          pagination={{ page: 1, limit: LIMIT, total: 0, onPageChange: () => {} }}
        />
      )}

      {mode === "create" && (
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap gap-3 w-full mb-2">
            <Input placeholder="Exam name..." value={examName} onChange={(e) => setExamName(e.target.value)} />
          </div>
          <Button variant="primary" size="sm" disabled={!examName} onClick={async () => { await fetch(`/teacher/exams`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` }, body: JSON.stringify({ name: examName }) }); setMode("list"); qc.invalidateQueries({ queryKey: ["exams"] }); toast.success("Exam created"); }}>
            Create
          </Button>
        </div>
      )}
    </div>
  );
}
