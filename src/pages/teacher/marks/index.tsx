import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";

import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";
import { Badge } from "@/components/ui/badge";

const LIMIT = 20;

export default function TeacherMarksEntryPage() {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [examName, setExamName] = useState("");
  const qc = useQueryClient();

  // Candidate list for selected exam
  const candidatesQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MY_CLASSES],
    queryFn: () => ({ classesUrl: "/teacher/my-classes" }),
  });

  // Marks grid (one column per subject)
  const marksQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MARKS, selectedExamId],
    queryFn: () => ({ marksUrl: "/teacher/marks" }),
  });

  if (candidatesQuery.isLoading || marksQuery.isLoading) return <ScreenLoader />;
  if (marksQuery.isError) return <AlertHandler variant="error" />;

  const candidates: T_STUDENT_CANDIDATE[] = candidatesQuery.data?.data?.data ?? [];
  const subjects: T_SUBJECT[] = []; // fetched separately
  const examNameLabel = examName || "Select an exam";

  const mut = useMutation({
    mutationFn: async () => {
      await fetch(`/teacher/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` },
        body: JSON.stringify({ examId: selectedExamId }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_MARKS] }); toast.success("Marks submitted — awaiting Principal approval"); },
  });

  return (
    <div className="p-5">
      <PageHeader title="Marks Entry" breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "Marks Entry", link: "/teacher/marks" }]} createPage="/teacher/marks?mode=new" />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Select exam..." value={selectedExamId} onChange={(e) => { setSelectedExamId(e.target.value); setExamName(e.target.value); }} />
        <span className="self-center text-xs text-muted-foreground">Save as draft, then click Generate Result.</span>
      </div>

      <GenericTable
        tableHeads={[
          { key: "studentName", headName: "Student", minWidth: 200 },
          { key: "rollNo", headName: "Roll No.", minWidth: 120 },
          ...subjects.map((s) => ({ key: s.code, headName: `M${String(Number(s.code).slice(-2))}`, minWidth: 120 })),
          { key: "absentCheck", headName: "Absent", minWidth: 120, render: (r: any) => r.absentChecked ? <Badge variant="destructive">YES</Badge> : "" },
        ]}
        data={[]}
        emptyTitle="No students for this exam."
        renderRow={() => ({ studentName: "", rollNo: "" } as Record<string, React.ReactNode>)}
      />

      {selectedExamId && (
        <Button variant="primary" size="sm" disabled={!selectedExamId || !examName || mut.isPending}
          onClick={async () => { await mut.mutateAsync(); }}>
          {mut.isPending ? "Generating..." : "Generate Result"}
        </Button>
      )}
    </div>
  );
}

type T_STUDENT_CANDIDATE = { id: string; studentName: string; rollNo: number };
type T_SUBJECT = { code: string; name: string };
