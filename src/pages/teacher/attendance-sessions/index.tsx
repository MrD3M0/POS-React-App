import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listMyClasses, type T_MY_CLASS } from "../my-classes/service/service";
import {
  listAttendanceSessions,
  createAttendanceSession,
  updateAttendanceSession,
  deleteAttendanceSession,
  listPeriods,
  getAttendanceSessionRoster,
  type T_ATTENDANCE_SESSION,
  type T_ATTENDANCE_ROSTER_ENTRY,
  type T_PERIOD,
} from "./service/service";
import CreateAttendanceSessionForm from "./components/create-attendance-session-form";
import EditAttendanceSessionForm, {
  type AttendanceSessionSubmitValues,
} from "./components/edit-attendance-session-form";
import type { AttendanceSessionValues } from "./schema";
import {
  personName,
  teachingAssignmentLabel,
} from "@/lib/teaching-assignment-label";

const LIMIT = 20;

function assignmentLabel(r: T_ATTENDANCE_SESSION): string {
  const label = teachingAssignmentLabel(r.teachingAssignment);
  return label || r.teachingAssignmentId || "—";
}
function teacherLabel(r: T_ATTENDANCE_SESSION): string {
  const fromAssignment = personName(r.teachingAssignment?.teacher?.employee);
  if (fromAssignment) return fromAssignment;
  const fromSession = personName(r.teacher?.employee);
  return fromSession || r.teacherId || r.teacher?.employeeId || "—";
}
function periodLabel(r: T_ATTENDANCE_SESSION): string {
  const p = r.period;
  if (p)
    return (
      p.name ?? (p.periodNumber != null ? `Period ${p.periodNumber}` : "—")
    );
  return r.periodId ?? "—";
}
function isLocked(r: T_ATTENDANCE_SESSION): boolean {
  return Boolean(r.isLocked ?? r.locked ?? false);
}
function toRows(raw: unknown): { rows: T_ATTENDANCE_SESSION[]; total: number } {
  const r = raw as {
    data?:
      | T_ATTENDANCE_SESSION[]
      | { data?: T_ATTENDANCE_SESSION[]; pagination?: { total?: number } };
  };
  const rows: T_ATTENDANCE_SESSION[] = Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
  const total: number =
    Number(!Array.isArray(r?.data) ? r?.data?.pagination?.total : undefined) ||
    rows.length;
  return { rows, total };
}
function toClassRows(raw: unknown): T_MY_CLASS[] {
  const r = raw as { data?: T_MY_CLASS[] | { data?: T_MY_CLASS[] } };
  return Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
}
function toPeriodRows(raw: unknown): T_PERIOD[] {
  const r = raw as { data?: T_PERIOD[] | { data?: T_PERIOD[] } };
  return Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
}
function toRosterRows(raw: unknown): T_ATTENDANCE_ROSTER_ENTRY[] {
  const r = raw as { data?: T_ATTENDANCE_ROSTER_ENTRY[] };
  return Array.isArray(r?.data) ? r.data : [];
}

export default function TeacherAttendanceSessionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editRecord, setEditRecord] = useState<T_ATTENDANCE_SESSION | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  // Deep link support: /teacher/attendance-sessions?mode=create opens the
  // create form. The state is adjusted during render (React's recommended
  // pattern) instead of inside an effect.
  const requestedMode = searchParams.get("mode");
  const [handledRequest, setHandledRequest] = useState<string | null>(null);
  if (requestedMode === "create" && handledRequest !== requestedMode) {
    setHandledRequest(requestedMode);
    setMode("create");
    setEditRecord(null);
    setSearchParams({}, { replace: true });
  }

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_SESSIONS, page, search],
    queryFn: () => listAttendanceSessions({ page, limit: LIMIT, search }),
  });
  const classQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MY_CLASSES, "unlimited"],
    queryFn: () => listMyClasses({ page: 1, limit: 999 }),
  });
  const periodQuery = useQuery({
    queryKey: [
      QUERY_KEYS.TEACHER_ATTENDANCE_SESSIONS,
      "period-picker",
      "unlimited",
    ],
    queryFn: () => listPeriods({ page: 1, limit: 999 }),
  });
  const rosterQuery = useQuery({
    queryKey: [
      QUERY_KEYS.TEACHER_ATTENDANCE_SESSIONS,
      "roster",
      editRecord?.id,
    ],
    queryFn: () => getAttendanceSessionRoster(editRecord!.id),
    enabled: mode === "edit" && Boolean(editRecord?.id),
  });

  const { rows, total } = toRows(query.data);
  const classes = toClassRows(classQuery.data);
  const periods = toPeriodRows(periodQuery.data);
  const roster = toRosterRows(rosterQuery.data);

  function buildPayload(
    values: AttendanceSessionValues,
  ): Record<string, unknown> | null {
    const selectedClass = classes.find(
      (c) => c.id === values.teachingAssignmentId,
    );
    const teacherId =
      (selectedClass as (T_MY_CLASS & { teacherId?: string }) | undefined)
        ?.teacherId ?? "";
    if (!teacherId) {
      toast.error("Teacher could not be resolved for this assignment");
      return null;
    }
    return {
      teachingAssignmentId: values.teachingAssignmentId,
      teacherId,
      periodId: values.periodId,
      dateBs: values.dateBs,
      isLocked: values.isLocked,
    };
  }

  const createMut = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      createAttendanceSession(data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_SESSIONS],
      });
      toast.success("Attendance session created");
      setMode("list");
    },
    onError: () => toast.error("Failed to create attendance session"),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateAttendanceSession(id, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_SESSIONS],
      });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_SHEET] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE] });
      toast.success("Attendance session updated");
      setMode("list");
      setEditRecord(null);
    },
    onError: () => toast.error("Failed to update attendance session"),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const head: T_TableHead<T_ATTENDANCE_SESSION>[] = [
    {
      key: "teachingAssignment",
      headName: "Teaching Assignment",
      minWidth: 220,
      render: (r) => assignmentLabel(r),
    },
    {
      key: "teacher",
      headName: "Teacher",
      minWidth: 180,
      render: (r) => teacherLabel(r),
    },
    {
      key: "period",
      headName: "Period",
      minWidth: 140,
      render: (r) => periodLabel(r),
    },
    {
      key: "dateBs",
      headName: "Date (BS)",
      minWidth: 120,
      render: (r) => r.dateBs ?? "—",
    },
    {
      key: "locked",
      headName: "Locked",
      minWidth: 100,
      render: (r) => (
        <Badge variant={isLocked(r) ? "warning" : "outline"}>
          {isLocked(r) ? "Locked" : "Open"}
        </Badge>
      ),
    },
  ];

  if (mode === "create" || mode === "edit") {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title={mode === "create" ? "Create Session" : "Edit Session"}
          backPage="/teacher/attendance-sessions"
          backPageTitle="Back to Sessions"
          breadCrumbItems={[
            { title: "Teacher", link: "/teacher/attendance-sessions" },
            {
              title: "Attendance Sessions",
              link: "/teacher/attendance-sessions",
            },
            { title: mode === "create" ? "Create" : "Edit" },
          ]}
        />
        {mode === "create" && (
          <CreateAttendanceSessionForm
            classes={classes}
            periods={periods}
            classesLoading={classQuery.isLoading}
            periodsLoading={periodQuery.isLoading}
            isPending={createMut.isPending}
            onCancel={() => setMode("list")}
            onSubmit={(values) => {
              const payload = buildPayload(values);
              if (payload) createMut.mutate(payload);
            }}
          />
        )}
        {mode === "edit" && editRecord && (
          <EditAttendanceSessionForm
            key={editRecord.id}
            record={editRecord}
            classes={classes}
            periods={periods}
            roster={roster}
            classesLoading={classQuery.isLoading}
            periodsLoading={periodQuery.isLoading}
            rosterLoading={rosterQuery.isLoading}
            isPending={updateMut.isPending}
            onCancel={() => {
              setMode("list");
              setEditRecord(null);
            }}
            onSubmit={(id, values) => {
              const payload = buildPayload(values);
              if (!payload) return;
              const withRecords: AttendanceSessionSubmitValues = values;
              updateMut.mutate({
                id,
                data: { ...payload, records: withRecords.records },
              });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-5">
      <PageHeader
        title="Attendance Sessions"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher" },
          {
            title: "Attendance Sessions",
            link: "/teacher/attendance-sessions",
          },
        ]}
        createPage="/teacher/attendance-sessions?mode=create"
        createPageTitle="Create Session"
      />
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search sessions..."
        emptyTitle="No attendance sessions yet."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        renderRow={(r) =>
          ({
            teachingAssignment: assignmentLabel(r),
            teacher: teacherLabel(r),
            period: periodLabel(r),
            dateBs: r.dateBs ?? "—",
            locked: isLocked(r) ? "Locked" : "Open",
          }) as Record<string, React.ReactNode>
        }
        renderActions={(r) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditRecord(r);
              setMode("edit");
            }}
          >
            Edit
          </Button>
        )}
        onDelete={(r) => setDeleteId(r.id)}
      />
      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Attendance session"
          onDelete={deleteAttendanceSession}
          onSuccess={() =>
            qc.invalidateQueries({
              queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_SESSIONS],
            })
          }
        />
      )}
    </div>
  );
}
