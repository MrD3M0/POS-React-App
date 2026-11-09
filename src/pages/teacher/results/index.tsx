import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { listResults, createResult, type T_RESULT } from "./service/service";
import { listExams, type T_EXAM } from "../exams/service/service";
import { listStudentsForTeacher, type T_STUDENT } from "../students/service/service";
import GenerateResultForm from "./components/generate-result-form";

const LIMIT = 20;

export default function TeacherResultsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_RESULTS, page, search],
    queryFn: () => listResults({ page, limit: LIMIT, search }),
  });
  const examsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAMS, "results-picker", "unlimited"],
    queryFn: () => listExams({ page: 1, limit: 999 }),
  });
  const studentsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_STUDENTS, "results-picker", "unlimited"],
    queryFn: () => listStudentsForTeacher({ page: 1, limit: 999 }),
  });

  const genMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => createResult(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_RESULTS] }); toast.success("Result generated"); setShowGenerate(false); },
    onError: () => toast.error("Failed to generate result"),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const raw = query.data as unknown as { data?: T_RESULT[] | { data?: T_RESULT[]; pagination?: { total?: number } } };
  const rows: T_RESULT[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.data?.data) ? raw.data.data : [];
  const total: number = Number((!Array.isArray(raw?.data) ? raw?.data?.pagination?.total : undefined)) || rows.length;

  const exams: T_EXAM[] = Array.isArray(examsQuery.data?.data)
    ? ((examsQuery.data as { data?: T_EXAM[] }).data ?? [])
    : Array.isArray(examsQuery.data?.data?.data)
      ? examsQuery.data.data.data
      : [];
  const students: T_STUDENT[] = Array.isArray(studentsQuery.data?.data)
    ? ((studentsQuery.data as { data?: T_STUDENT[] }).data ?? [])
    : Array.isArray(studentsQuery.data?.data?.data)
      ? studentsQuery.data.data.data
      : [];

  const head: T_TableHead<T_RESULT>[] = [
    { key: "examName", headName: "Exam", minWidth: 240, render: (r) => r.examName ?? r.exam?.name ?? "—" },
    { key: "batchName", headName: "Batch", minWidth: 200, render: (r) => r.batchName ?? r.batch?.name ?? "—" },
    { key: "status", headName: "Status", minWidth: 180, render: (r) => { const s = r.status ?? "—"; return <Badge variant={s === "APPROVED" ? "success" : s === "PUBLISHED" ? "default" : s === "REJECTED" ? "destructive" : "warning"}>{s}</Badge>; } },
    { key: "gpa", headName: "GPA", minWidth: 100, render: (r) => r.gpa ?? "—" },
  ];

  return (
    <div className="p-5">
      <PageHeader title="My Results" breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "Results", link: "/teacher/results" }]} />
      <div className="mb-4 flex flex-wrap gap-3 w-full max-w-4xl items-start">
        <Button variant="outline" size="sm" onClick={() => setShowGenerate((v) => !v)}>Generate Result</Button>
        {showGenerate && (
          <GenerateResultForm
            examOptions={exams.map((e) => ({ label: String(e.examName ?? e.name ?? e.id), value: e.id, searchValues: String(e.examName ?? e.name ?? "") }))}
            studentOptions={students.map((s) => {
              const name = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || s.id;
              return { label: name, value: s.id, searchValues: `${name} ${s.universityRegNo ?? ""}` };
            })}
            examsLoading={examsQuery.isLoading}
            studentsLoading={studentsQuery.isLoading}
            isPending={genMut.isPending}
            onSubmit={(values) => genMut.mutate(values)}
          />
        )}
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search results..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No results yet."
        renderActions={(r) => (
          <Link
            to={`/teacher/results/${r.id}`}
            className="inline-flex items-center rounded border border-border px-2 py-1 text-xs font-medium hover:bg-muted"
          >
            View
          </Link>
        )}
      />
    </div>
  );
}
