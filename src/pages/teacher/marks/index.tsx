import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import SelectCommand from "@/components/select-command";
import { InputWithSwitch } from "@/components/input-with-switch";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listExams, type T_EXAM } from "../exams/service/service";
import { listExamSubjects, type T_EXAM_SUBJECT } from "../exam-subjects/service/service";
import { listStudentsForTeacher, type T_STUDENT } from "../students/service/service";
import { listMarks, bulkMarks, type T_MARK } from "./service/service";
import { createResult } from "../results/service/service";

type MarkRow = { marks: string; isAbsent: boolean };

function toRows<T>(raw: unknown): T[] {
  const r = raw as { data?: T[] | { data?: T[] } };
  return Array.isArray(r?.data) ? r.data : Array.isArray(r?.data?.data) ? r.data.data : [];
}
function studentName(s: T_STUDENT): string {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || s.universityRegNo || s.id;
}
function examLabel(e: T_EXAM): string {
  return String(e.examName ?? e.name ?? e.id);
}
function examSubjectLabel(r: T_EXAM_SUBJECT): string {
  const s = r.batchTermSubject?.subject;
  const code = s?.code ?? s?.name ?? "";
  const examName = r.exam?.name ?? "";
  const parts = [examName, code].filter(Boolean).join(" · ");
  return parts || r.id;
}

export default function TeacherMarksEntryPage() {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedExamSubjectId, setSelectedExamSubjectId] = useState("");
  const [grid, setGrid] = useState<Map<string, MarkRow>>(() => new Map());
  const [savedOnce, setSavedOnce] = useState(false);
  const qc = useQueryClient();

  const examsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAMS, "marks-entry", "unlimited"],
    queryFn: () => listExams({ page: 1, limit: 999 }),
  });
  const examSubjectsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAM_SUBJECTS, selectedExamId, "unlimited"],
    queryFn: () => listExamSubjects({ page: 1, limit: 999, examId: selectedExamId || undefined }),
    enabled: !!selectedExamId,
  });
  const studentsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_STUDENTS, "marks-picker", "unlimited"],
    queryFn: () => listStudentsForTeacher({ page: 1, limit: 999 }),
  });
  const marksQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MARKS, selectedExamSubjectId],
    queryFn: () =>
      listMarks({
        page: 1,
        limit: 999,
        examId: selectedExamId,
        examSubjectId: selectedExamSubjectId,
      }),
    enabled: !!selectedExamId && !!selectedExamSubjectId,
  });

  const bulkMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => bulkMarks(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_MARKS] });
      setSavedOnce(true);
      toast.success("Marks saved");
    },
    onError: () => toast.error("Failed to save marks"),
  });
  const genMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => createResult(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_RESULTS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_MARKS] });
      toast.success("Result generated");
    },
    onError: () => toast.error("Failed to generate result"),
  });

  const exams = useMemo(() => toRows<T_EXAM>(examsQuery.data), [examsQuery.data]);
  const students = useMemo(() => toRows<T_STUDENT>(studentsQuery.data), [studentsQuery.data]);
  const examSubjects = useMemo(() => {
    const rows = toRows<T_EXAM_SUBJECT>(examSubjectsQuery.data);
    // Backend may ignore examId filter — keep client-side filter as fallback.
    return rows.filter((r) => !r.examId || !selectedExamId || r.examId === selectedExamId);
  }, [examSubjectsQuery.data, selectedExamId]);
  const existingMarks = useMemo(() => {
    const rows = toRows<T_MARK>(marksQuery.data);
    return rows.filter((m) => !m.examSubjectId || m.examSubjectId === selectedExamSubjectId);
  }, [marksQuery.data, selectedExamSubjectId]);

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const selectedExamSubject = examSubjects.find((s) => s.id === selectedExamSubjectId);
  const fullMarks = useMemo(() => {
    const n = selectedExamSubject?.fullMarks != null ? Number(selectedExamSubject.fullMarks) : NaN;
    return Number.isFinite(n) ? n : undefined;
  }, [selectedExamSubject]);

  // Pre-fill local Map from existing marks when the subject selection loads.
  useEffect(() => {
    if (!selectedExamSubjectId) return;
    const next = new Map<string, MarkRow>();
    for (const m of existingMarks) {
      const sid = String(m.studentId ?? m.student?.id ?? "");
      if (!sid) continue;
      const raw = m.marks ?? m.obtainedMarks ?? "";
      next.set(sid, {
        marks: raw === "" || raw == null ? "" : String(raw),
        isAbsent: Boolean((m as Record<string, unknown>).isAbsent),
      });
    }
    setGrid(next);
    setSavedOnce(false);
  }, [selectedExamSubjectId, existingMarks]);

  if (examsQuery.isLoading || examSubjectsQuery.isLoading || studentsQuery.isLoading) return <ScreenLoader />;
  if (examsQuery.isError) return <AlertHandler variant="error" />;

  function rowState(studentId: string): MarkRow {
    return grid.get(studentId) ?? { marks: "", isAbsent: false };
  }
  function patchRow(studentId: string, patch: Partial<MarkRow>) {
    setGrid((prev) => {
      const next = new Map(prev);
      const cur = next.get(studentId) ?? { marks: "", isAbsent: false };
      next.set(studentId, { ...cur, ...patch });
      return next;
    });
    setSavedOnce(false);
  }

  function validateRow(studentId: string): string | null {
    const { marks, isAbsent } = rowState(studentId);
    if (isAbsent) return null;
    if (marks.trim() === "") return null;
    const n = Number(marks);
    if (!Number.isFinite(n)) return "Enter a valid number.";
    if (n < 0) return "Marks cannot be negative.";
    if (fullMarks != null && n > fullMarks) return `Must be ≤ ${fullMarks}.`;
    return null;
  }
  const errors = new Map<string, string>();
  for (const s of students) {
    const err = validateRow(s.id);
    if (err) errors.set(s.id, err);
  }
  const hasErrors = errors.size > 0;

  function handleSave() {
    if (!selectedExamId || !selectedExamSubjectId) {
      toast.error("Select exam and exam subject first");
      return;
    }
    if (hasErrors) {
      toast.error("Fix marks that exceed full marks before saving");
      return;
    }
    const marks = students.map((s) => {
      const { marks: raw, isAbsent } = rowState(s.id);
      const empty = raw.trim() === "";
      const value = isAbsent || empty ? 0 : Number(raw);
      return {
        studentId: s.id,
        examId: selectedExamId,
        examSubjectId: selectedExamSubjectId,
        marks: value,
        obtainedMarks: value,
        isAbsent,
      };
    });
    bulkMut.mutate({ examId: selectedExamId, examSubjectId: selectedExamSubjectId, marks });
  }

  function handleGenerate() {
    genMut.mutate({ examId: selectedExamId, examSubjectId: selectedExamSubjectId || undefined });
  }

  const canSave = !!selectedExamId && !!selectedExamSubjectId && students.length > 0 && !hasErrors;

  return (
    <div className="p-5">
      <PageHeader
        title="Marks Entry"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          { title: "Marks Entry", link: "/teacher/marks" },
        ]}
      />
      {selectedExam && (
        <p className="text-sm font-medium text-foreground mb-3">{examLabel(selectedExam)}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-4xl mb-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Exam</p>
          <SelectCommand
            value={selectedExamId}
            onChange={(v) => {
              setSelectedExamId(v);
              setSelectedExamSubjectId("");
              setGrid(new Map());
              setSavedOnce(false);
            }}
            options={exams.map((e) => ({ label: examLabel(e), value: e.id, searchValues: examLabel(e) }))}
            placeholder={examsQuery.isLoading ? "Loading exams..." : "Select exam..."}
            searchPlaceholder="Search exams..."
            loading={examsQuery.isLoading}
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Exam Subject{fullMarks != null ? ` (full marks: ${fullMarks})` : ""}</p>
          <SelectCommand
            value={selectedExamSubjectId}
            onChange={(v) => {
              setSelectedExamSubjectId(v);
              setSavedOnce(false);
            }}
            options={examSubjects.map((s) => ({ label: examSubjectLabel(s), value: s.id, searchValues: examSubjectLabel(s) }))}
            placeholder={examSubjectsQuery.isLoading ? "Loading exam subjects..." : "Select exam subject..."}
            searchPlaceholder="Search exam subjects..."
            loading={examSubjectsQuery.isLoading}
            disabled={!selectedExamId}
          />
        </div>
      </div>

      {!selectedExamId || !selectedExamSubjectId ? (
        <p className="text-sm text-muted-foreground">Select an exam and exam subject to load students.</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-2">
            {students.length} student{students.length === 1 ? "" : "s"} · Enter marks, save, then generate result.
            Empty marks are saved as 0.
          </p>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="sticky left-0 z-10 bg-muted px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">
                    Roll / Reg No
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">Student Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">Marks</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">Absent</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const row = rowState(s.id);
                  const err = errors.get(s.id);
                  return (
                    <tr key={s.id} className="border-t border-border">
                      <td className="sticky left-0 z-10 bg-background px-3 py-2 tabular-nums">
                        {s.universityRegNo || "—"}
                      </td>
                      <td className="px-3 py-2">{studentName(s)}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          max={fullMarks}
                          step="any"
                          inputMode="decimal"
                          disabled={row.isAbsent}
                          className="w-24 rounded border px-2 py-1.5 text-sm disabled:opacity-50 disabled:line-through"
                          value={row.marks}
                          onChange={(e) => patchRow(s.id, { marks: e.target.value })}
                          aria-label={`Marks for ${studentName(s)}`}
                          aria-invalid={!!err}
                        />
                        {err && <p className="mt-1 text-xs text-destructive">{err}</p>}
                      </td>
                      <td className="px-3 py-2">
                        <InputWithSwitch
                          value={row.isAbsent}
                          onChange={(v) => patchRow(s.id, { isAbsent: v })}
                          labels={{ on: "Absent", off: "Present" }}
                        />
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr className="border-t border-border">
                    <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button variant="primary" size="sm" disabled={!canSave || bulkMut.isPending} onClick={handleSave}>
              {bulkMut.isPending ? "Saving..." : "Save All"}
            </Button>
            {savedOnce && (
              <Button variant="outline" size="sm" disabled={genMut.isPending} onClick={handleGenerate}>
                {genMut.isPending ? "Generating..." : "Generate Result"}
              </Button>
            )}
            {hasErrors && <span className="text-xs text-destructive">Fix validation errors to save.</span>}
          </div>
        </>
      )}
    </div>
  );
}
