import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import SelectCommand from "@/components/select-command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listStudentsForTeacher, type T_STUDENT } from "../students/service/service";
import {
  bulkMarkAttendance,
  listAttendanceSessions,
  listStudentAttendance,
  type T_ATTENDANCE_SESSION,
  type T_STUDENT_ATTENDANCE,
} from "./service/service";

const STATUS_OPTIONS = [
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Leave", value: "LEAVE" },
  { label: "Half Day", value: "HALF_DAY" },
] as const;

type Status = (typeof STATUS_OPTIONS)[number]["value"];

function toRows<T>(raw: unknown): T[] {
  const r = raw as { data?: T[] | { data?: T[] } };
  if (Array.isArray(r?.data)) return r.data;
  return Array.isArray(r?.data?.data) ? r.data.data : [];
}

function sessionLabel(s: T_ATTENDANCE_SESSION): string {
  const batch = s.teachingAssignment?.batchTermSubject?.batchTerm?.batch?.name;
  const term = s.teachingAssignment?.batchTermSubject?.batchTerm?.name;
  const subject =
    s.teachingAssignment?.batchTermSubject?.subject?.code ??
    s.teachingAssignment?.batchTermSubject?.subject?.name;
  const period = s.period?.name ?? (s.period?.periodNumber != null ? `P${s.period.periodNumber}` : "");
  return [s.dateBs, batch, term, subject, period].filter(Boolean).join(" · ") || s.id;
}

function studentName(s: { firstName?: string; middleName?: string | null; lastName?: string; universityRegNo?: string } | null | undefined, fallbackId: string) {
  const name = [s?.firstName, s?.middleName, s?.lastName].filter(Boolean).join(" ").trim();
  return name || s?.universityRegNo || fallbackId;
}

export default function TeacherTakeAttendancePage() {
  const qc = useQueryClient();
  const [sessionId, setSessionId] = useState("");
  const [statusMap, setStatusMap] = useState<Record<string, Status>>({});

  const sessionsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_SESSIONS, "take-attendance", "unlimited"],
    queryFn: () => listAttendanceSessions({ page: 1, limit: 999 }),
  });

  const attendanceQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE, sessionId],
    queryFn: () => listStudentAttendance({ page: 1, limit: 999, sessionId }),
    enabled: !!sessionId,
  });

  const studentsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_STUDENTS, "take-attendance-roster", "unlimited"],
    queryFn: () => listStudentsForTeacher({ page: 1, limit: 999 }),
    enabled: !!sessionId,
  });

  const sessions = useMemo(() => toRows<T_ATTENDANCE_SESSION>(sessionsQuery.data), [sessionsQuery.data]);
  const existing = useMemo(() => toRows<T_STUDENT_ATTENDANCE>(attendanceQuery.data), [attendanceQuery.data]);
  const students = useMemo(() => toRows<T_STUDENT>(studentsQuery.data), [studentsQuery.data]);

  const selectedSession = sessions.find((s) => s.id === sessionId);

  // Build roster: prefer existing attendance records for the session; merge in loaded students.
  const roster = useMemo(() => {
    const byStudent = new Map<string, { studentId: string; name: string; regNo: string; current?: Status }>();
    for (const a of existing) {
      const sid = a.studentId ?? a.student?.id;
      if (!sid) continue;
      const st = (["PRESENT", "ABSENT", "LEAVE", "HALF_DAY"] as const).includes(a.status as Status)
        ? (a.status as Status)
        : undefined;
      byStudent.set(sid, {
        studentId: sid,
        name: studentName(a.student, sid),
        regNo: a.student?.universityRegNo ?? "",
        current: st,
      });
    }
    for (const s of students) {
      if (!byStudent.has(s.id)) {
        byStudent.set(s.id, {
          studentId: s.id,
          name: studentName(s, s.id),
          regNo: s.universityRegNo ?? "",
        });
      }
    }
    return Array.from(byStudent.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [existing, students]);

  useEffect(() => {
    if (!sessionId) {
      setStatusMap({});
      return;
    }
    const next: Record<string, Status> = {};
    for (const r of roster) next[r.studentId] = r.current ?? "PRESENT";
    setStatusMap(next);
  }, [sessionId, attendanceQuery.data, studentsQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: () => {
      const records = roster.map((r) => ({
        studentId: r.studentId,
        status: statusMap[r.studentId] ?? "PRESENT",
      }));
      return bulkMarkAttendance({ sessionId, records });
    },
    onSuccess: () => {
      toast.success("Attendance saved for session.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE, sessionId] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE] });
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "Failed to save attendance.");
    },
  });

  const sessionOptions = sessions.map((s) => ({
    label: sessionLabel(s),
    value: s.id,
    searchValues: `${sessionLabel(s)} ${s.dateBs ?? ""}`,
  }));

  if (sessionsQuery.isLoading) return <ScreenLoader />;
  if (sessionsQuery.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Take Attendance"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          { title: "Take Attendance", link: "/teacher/take-attendance" },
        ]}
      />

      <div className="mb-4 grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-medium">Attendance Session</p>
          <SelectCommand
            value={sessionId}
            onChange={(v) => setSessionId(v ?? "")}
            options={sessionOptions}
            placeholder={sessionsQuery.isLoading ? "Loading sessions..." : "Select attendance session..."}
            searchPlaceholder="Search sessions..."
            loading={sessionsQuery.isLoading}
          />
          <p className="text-xs text-muted-foreground">Select a session (ID reference, unlimited options). Backend bulk-marks against the session roster.</p>
        </div>
        <div className="flex items-end gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={!sessionId || roster.length === 0 || mutation.isPending}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Save Attendance
          </Button>
          {selectedSession?.isLocked ? (
            <span className="text-xs text-amber-700">Session is locked; only authorized roles may edit (backend enforced).</span>
          ) : null}
        </div>
      </div>

      {!sessionId ? (
        <p className="text-sm text-muted-foreground">Select an attendance session to load students and mark attendance.</p>
      ) : attendanceQuery.isLoading || studentsQuery.isLoading ? (
        <ScreenLoader />
      ) : attendanceQuery.isError ? (
        <AlertHandler variant="error" />
      ) : roster.length === 0 ? (
        <p className="text-sm text-muted-foreground">No students found for this session. Ensure the session has an approved/active roster.</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted-foreground">
            {roster.length} student{roster.length === 1 ? "" : "s"} loaded. Status is an enum selector per row; saving submits bulk records to the backend.
          </p>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">Reg No</TableHead>
                  <TableHead className="min-w-[220px]">Student</TableHead>
                  <TableHead className="min-w-[220px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roster.map((r) => (
                  <TableRow key={r.studentId}>
                    <TableCell className="tabular-nums">{r.regNo || "—"}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>
                      <div className="max-w-[220px]">
                        <SelectCommand
                          value={statusMap[r.studentId] ?? "PRESENT"}
                          onChange={(v) => setStatusMap((m) => ({ ...m, [r.studentId]: (v as Status) || "PRESENT" }))}
                          options={STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                          placeholder="Select status"
                          hideSearch
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
