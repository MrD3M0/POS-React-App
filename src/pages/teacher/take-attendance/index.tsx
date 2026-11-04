import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";

const LIMIT = 100;

export default function TeacherTakeAttendancePage() {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-01-01");
  const [statusFilter, setStatusFilter] = useState(""); // "" means everything else is marked present by default
  const qc = useQueryClient();

  const classQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MY_CLASSES],
    queryFn: () => ({ classesUrl: "/teacher/my-classes" }),
  });

  // attendance for selected class+date — default present for everyone else
  const attQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE, selectedClassId, selectedDate],
    queryFn: () => ({ attUrl: "/teacher/attendance" }),
  });

  if (classQuery.isLoading || attQuery.isLoading) return <ScreenLoader />;
  if (attQuery.isError) return <AlertHandler variant="error" />;

  const classes: T_CLASS[] = classQuery.data?.data?.data ?? [];
  const attendees: T_STUDENT_ATTMARK[] = attQuery.data?.data?.data ?? [];

  const takeAttMut = useMutation({
    mutationFn: async () => {
      await fetch(`/teacher/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` },
        body: JSON.stringify({ classId: selectedClassId, date: selectedDate, marks: statusFilter ? { allPresent: false } : undefined }),
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE] }); toast.success("Attendance saved"); },
  });

  const markAllPresent = async () => {
    await takeAttMut.mutateAsync();
    toast.success("All students marked present");
  };

  const head: T_TableHead<T_STUDENT_ATTMARK>[] = [
    { key: "studentName", headName: "Student", minWidth: 200 },
    { key: "status", headName: "Status", minWidth: 160, render: (a) => <Badge variant={mapStatus(a.mark)}>{a.mark}</Badge> },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Take Attendance"
        breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "Take Attendance", link: "/teacher/take-attendance" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Select class..." value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} />
        <select className="rounded border px-3 py-1 text-sm bg-background" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
          <option value="">Date</option>
          {[...Array(30)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - i); const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0"); return <option key={i} value={`${y}-${m}-${day}`}>—{y}.{m}.{day}</option>; })}
        </select>
        <Button variant="primary" size="sm" disabled={!selectedClassId || !selectedDate || takeAttMut.isPending} onClick={markAllPresent}>
          {takeAttMut.isPending ? "Saving..." : "Mark all present"}
        </Button>
      </div>

      <GenericTable
        tableHeads={head}
        data={attendees}
        emptyTitle="No students for this class & date."
        pagination={{ page: 1, limit: LIMIT, total: attendees.length, onPageChange: () => {} }}
        searchPlaceholder="Select class..."
        renderRow={(a) => ({ studentName: a.studentName, status: mapStatus(a.mark) } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}

function mapStatus(m: string): Badge["variant"] {
  if (m === "PRESENT") return "default";
  if (m === "ABSENT") return "destructive";
  if (m === "LEAVE") return "secondary";
  if (m === "HALF DAY") return "warning";
  return "outline";
}

type T_CLASS = { id: string; batchName: string; subjectCode: string; className: string; studentCount: number };
type T_STUDENT_ATTMARK = { studentId: string; studentName: string; mark: "PRESENT" | "ABSENT" | "LEAVE" | "HALF DAY" };
