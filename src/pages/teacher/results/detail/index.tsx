import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getResultById, listResultSubjects, type T_RESULT_DETAIL, type T_RESULT_SUBJECT } from "../service/service";

function studentName(r: T_RESULT_DETAIL): string {
  const s = r.student;
  if (s) {
    if (s.fullName) return s.fullName;
    const name = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
    if (name) return name;
  }
  return r.studentName ?? (typeof r.studentId === "string" ? r.studentId : "—");
}
function examName(r: T_RESULT_DETAIL): string {
  return r.exam?.name ?? r.examName ?? (typeof r.examId === "string" ? r.examId : "—");
}
function fmt(v: number | string | null | undefined): string {
  if (v == null || v === "") return "—";
  return String(v);
}
function gradeLabel(s: T_RESULT_SUBJECT): string {
  const g = s.gradeScale;
  if (g) return String(g.grade ?? g.name ?? g.gradePoint ?? "—");
  return s.gradePoint != null ? String(s.gradePoint) : "—";
}

export default function TeacherResultDetailPage() {
  const { id } = useParams<{ id: string }>();

  const resultQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_RESULT_DETAIL, id],
    queryFn: () => getResultById(id as string),
    enabled: !!id,
  });
  const subjectsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_RESULT_DETAIL, id, "subjects"],
    queryFn: () => listResultSubjects({ page: 1, limit: 999, resultId: id as string }),
    enabled: !!id,
  });

  if (resultQuery.isLoading) return <ScreenLoader />;
  if (resultQuery.isError) return <AlertHandler variant="error" />;

  const raw = resultQuery.data as { data?: T_RESULT_DETAIL };
  const result = raw?.data as T_RESULT_DETAIL | undefined;

  const subjRaw = subjectsQuery.data as { data?: T_RESULT_SUBJECT[] | { data?: T_RESULT_SUBJECT[] } };
  const fetchedSubjects: T_RESULT_SUBJECT[] = Array.isArray(subjRaw?.data)
    ? subjRaw.data
    : Array.isArray(subjRaw?.data?.data)
      ? subjRaw.data.data
      : [];
  const subjects: T_RESULT_SUBJECT[] = fetchedSubjects.length > 0 ? fetchedSubjects : (result?.subjects ?? []);

  if (!result) return <AlertHandler variant="error" />;

  const head: T_TableHead<T_RESULT_SUBJECT>[] = [
    { key: "subject", headName: "Subject", minWidth: 220, render: (s) => s.examSubjectId ?? "—" },
    { key: "marksObtained", headName: "Marks Obtained", minWidth: 150, render: (s) => fmt(s.marksObtained) },
    { key: "fullMarks", headName: "Full Marks", minWidth: 120, render: (s) => fmt(s.fullMarks) },
    { key: "creditHour", headName: "Credit Hour", minWidth: 120, render: (s) => fmt(s.creditHour) },
    { key: "grade", headName: "Grade", minWidth: 120, render: (s) => gradeLabel(s) },
    { key: "gradePoint", headName: "Grade Point", minWidth: 120, render: (s) => fmt(s.gradePoint) },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Report Card"
        breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "Results", link: "/teacher/results" }, { title: "Report Card", link: `/teacher/results/${id}` }]}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Button variant="primary" size="sm" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <div className="mb-6 max-w-2xl space-y-2 rounded border p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Student</span>
          <span className="font-medium">{studentName(result)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Exam</span>
          <span className="font-medium">{examName(result)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">GPA</span>
          <span className="font-medium">{fmt(result.gpa)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">CGPA</span>
          <span className="font-medium">{fmt(result.cgpa)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Percentage</span>
          <span className="font-medium">{fmt(result.percentage)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Marks</span>
          <span className="font-medium">{fmt(result.totalMarks)} / {fmt(result.fullMarks)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={result.status === "PUBLISHED" ? "success" : result.status === "APPROVED" ? "default" : result.status === "REJECTED" ? "destructive" : "warning"}>
            {result.status ?? "—"}
          </Badge>
        </div>
      </div>

      <GenericTable
        tableHeads={head}
        data={subjects}
        emptyTitle="No subjects in this result."
      />
    </div>
  );
}
