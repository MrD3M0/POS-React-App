/**
 * Builds T_CalendarEvent[] for the BS event calendar from EXISTING list
 * endpoints (Phase 1 is frontend-only — no backend changes). Each kind is its
 * own query so one failing endpoint never breaks the whole calendar.
 *
 * Month filtering: `listHolidays` supports yearBs/monthBs server-side; every
 * other endpoint here lacks month params, so rows are fetched once
 * (`limit: -1`, the established fetch-all convention) and filtered client-side.
 * TODO backend filter: terms, installments, exams, exam subjects, attendance
 * sessions, notices, employee attendance.
 */
import { useMemo } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useAuth } from "@/auth/context/auth-context";
import type { T_Role } from "@/lib/models";
import {
  compareBs,
  formatBs,
  getDaysInBsMonth,
  parseBs,
} from "@/lib/bs-date";
import type {
  T_CalendarEvent,
  T_CalendarEventKind,
} from "./calendar-types";

// Existing feature services (reused, not duplicated)
import { listHolidays } from "@/pages/admin/holidays/service/service";
import { listTerms } from "@/pages/admin/terms/service/service";
import { listInstallments } from "@/pages/accountant/billing/service/service";
import { listExams } from "@/pages/teacher/exams/service/service";
import { listExamSubjects } from "@/pages/teacher/exam-subjects/service/service";
import { listAttendanceSessions } from "@/pages/teacher/attendance-sessions/service/service";
import { listNotices as listSharedNotices } from "@/pages/notices/service/service";
import { listNotices as listStaffNotices } from "@/pages/staff/notices/service/service";
import { listTeacherNotices } from "@/pages/teacher/notices/service/service";
import { listMyAttendance } from "@/pages/staff/attendance/service/service";
import { getOwnStaff } from "@/pages/staff/profile/edit/service/service";

// ─── Role → kinds ────────────────────────────────────────────────────────────

/**
 * Only kinds whose endpoints already exist for that role are listed.
 * - TERM is wired for ADMIN only (`admin:terms:read`; the principal has no
 *   batch-term list page/endpoint of its own).
 * - FEE_DUE reuses the accountant installments endpoint; admin has no fee page
 *   of its own, so it stays accountant-only for now.
 * - ATTENDANCE (own employee record) is wired for STAFF via the existing
 *   staff page flow (profile lookup + EMPLOYEE_ATTENDANCE_URL).
 */
export const CALENDAR_KINDS_BY_ROLE: Record<T_Role, T_CalendarEventKind[]> = {
  ADMIN: ["HOLIDAY", "TERM", "NOTICE"],
  PRINCIPAL: ["HOLIDAY", "NOTICE"],
  ACCOUNTANT: ["HOLIDAY", "FEE_DUE", "NOTICE"],
  TEACHER: ["HOLIDAY", "EXAM", "CLASS", "NOTICE"],
  STAFF: ["HOLIDAY", "ATTENDANCE", "NOTICE"],
  STUDENT: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Normalizes the `{ data: { data: T[] } }` / `{ data: T[] }` list shapes. */
function rowsOf<T>(res: unknown): T[] {
  const body = (res as { data?: { data?: T[] } | T[] } | undefined)?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseCalendarEventsParams {
  year: number;
  month: number;
  /** Restrict to a subset of this role's kinds (intersection). */
  kinds?: T_CalendarEventKind[];
}

export interface UseCalendarEventsResult {
  events: T_CalendarEvent[];
  isLoading: boolean;
  /** True only when EVERY active kind query failed. */
  isError: boolean;
  isEmpty: boolean;
  /** Kinds available to the signed-in role (before the `kinds` override). */
  roleKinds: T_CalendarEventKind[];
  /** Per-kind errors, so pages can show partial failures if they want to. */
  errors: Partial<Record<T_CalendarEventKind, unknown>>;
}

export function useCalendarEvents({
  year,
  month,
  kinds: kindsOverride,
}: UseCalendarEventsParams): UseCalendarEventsResult {
  const { user } = useAuth();
  const role = user?.role;

  const roleKinds = useMemo<T_CalendarEventKind[]>(
    () => (role ? CALENDAR_KINDS_BY_ROLE[role] ?? [] : []),
    [role],
  );
  const kinds = useMemo(
    () =>
      kindsOverride
        ? roleKinds.filter((kind) => kindsOverride.includes(kind))
        : roleKinds,
    [kindsOverride, roleKinds],
  );

  const wants = (kind: T_CalendarEventKind) => kinds.includes(kind);

  const monthStart = formatBs({ year, month, day: 1 });
  const monthEnd = formatBs({ year, month, day: getDaysInBsMonth(year, month) });

  // ── HOLIDAY — all roles; server-side yearBs/monthBs filter ✓ ───────────────
  const holidayQuery = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, role, year, month, kinds, "HOLIDAY"],
    queryFn: () => listHolidays({ page: 1, limit: -1, yearBs: year, monthBs: month }),
    enabled: wants("HOLIDAY"),
  });

  // ── TERM — ADMIN only; client-side month filter ────────────────────────────
  const termQuery = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, role, year, month, kinds, "TERM"],
    queryFn: () => listTerms({ page: 1, limit: -1 }),
    enabled: wants("TERM"),
  });

  // ── FEE_DUE — ACCOUNTANT; client-side month filter ─────────────────────────
  const installmentQuery = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, role, year, month, kinds, "FEE_DUE"],
    queryFn: () => listInstallments({ page: 1, limit: -1 }),
    enabled: wants("FEE_DUE"),
  });

  // ── EXAM — TEACHER; two sources (exam range + per-subject date) ────────────
  const examQuery = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, role, year, month, kinds, "EXAM"],
    queryFn: () => listExams({ page: 1, limit: -1 }),
    enabled: wants("EXAM"),
  });
  const examSubjectQuery = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, role, year, month, kinds, "EXAM_SUBJECT"],
    queryFn: () => listExamSubjects({ page: 1, limit: -1 }),
    enabled: wants("EXAM"),
  });

  // ── CLASS — TEACHER, own sessions; client-side month filter ────────────────
  const sessionQuery = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, role, year, month, kinds, "CLASS"],
    queryFn: () => listAttendanceSessions({ page: 1, limit: -1 }),
    enabled: wants("CLASS"),
  });

  // ── NOTICE — role-scoped list; client-side month filter on expiresOnBs ─────
  const noticeQuery = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, role, year, month, kinds, "NOTICE"],
    queryFn: () => {
      if (role === "TEACHER") {
        return listTeacherNotices({ page: 1, limit: -1 });
      }
      if (role === "STAFF") {
        return listStaffNotices({ page: 1, limit: -1 });
      }
      // ADMIN / PRINCIPAL / ACCOUNTANT use the shared /notice list.
      return listSharedNotices({ page: 1, limit: -1 });
    },
    enabled: wants("NOTICE"),
  });

  // ── ATTENDANCE — STAFF own record (profile lookup first, like the page) ────
  const staffProfileQuery = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PROFILE],
    queryFn: getOwnStaff,
    enabled: role === "STAFF" && wants("ATTENDANCE"),
  });
  const staff = staffProfileQuery.data?.data as
    | { employeeId?: string; employee?: { id?: string } | null }
    | undefined;
  const employeeId = staff?.employeeId ?? staff?.employee?.id ?? undefined;
  const attendanceQuery = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, role, year, month, kinds, "ATTENDANCE", employeeId],
    queryFn: () => listMyAttendance({ page: 1, limit: -1, employeeId }),
    enabled: role === "STAFF" && wants("ATTENDANCE") && (staffProfileQuery.isSuccess || staffProfileQuery.isError),
  });

  // ── Aggregate ──────────────────────────────────────────────────────────────
  const queries: Array<{
    kind: T_CalendarEventKind;
    query: UseQueryResult<unknown>;
    enabled: boolean;
  }> = [
    { kind: "HOLIDAY", query: holidayQuery, enabled: wants("HOLIDAY") },
    { kind: "TERM", query: termQuery, enabled: wants("TERM") },
    { kind: "FEE_DUE", query: installmentQuery, enabled: wants("FEE_DUE") },
    { kind: "EXAM", query: examQuery, enabled: wants("EXAM") },
    { kind: "CLASS", query: sessionQuery, enabled: wants("CLASS") },
    { kind: "NOTICE", query: noticeQuery, enabled: wants("NOTICE") },
    {
      kind: "ATTENDANCE",
      query: attendanceQuery,
      enabled: role === "STAFF" && wants("ATTENDANCE"),
    },
  ];
  // exam subjects count as part of the EXAM kind
  if (wants("EXAM")) {
    queries.push({ kind: "EXAM", query: examSubjectQuery, enabled: true });
  }

  const active = queries.filter((entry) => entry.enabled);

  const isLoading = active.some((entry) => entry.query.isLoading);
  const isError = active.length > 0 && active.every((entry) => entry.query.isError);

  const errors = useMemo(() => {
    const map: Partial<Record<T_CalendarEventKind, unknown>> = {};
    for (const entry of active) {
      if (entry.query.isError) map[entry.kind] = entry.query.error;
    }
    return map;
  }, [active]);

  const events = useMemo<T_CalendarEvent[]>(() => {
    const start = parseBs(monthStart);
    const end = parseBs(monthEnd);
    if (!start || !end) return [];

    /** Single-day date inside the visible month. */
    const inMonth = (bs?: string | null): boolean => {
      const date = parseBs(bs);
      if (!date) return false;
      return compareBs(date, start) >= 0 && compareBs(date, end) <= 0;
    };

    /** Range overlapping the visible month (multi-day aware). */
    const overlapsMonth = (startBs?: string | null, endBs?: string | null): boolean => {
      const rangeStart = parseBs(startBs);
      if (!rangeStart) return false;
      const rangeEnd = parseBs(endBs ?? startBs) ?? rangeStart;
      return compareBs(rangeStart, end) <= 0 && compareBs(rangeEnd, start) >= 0;
    };

    const result: T_CalendarEvent[] = [];

    // HOLIDAY
    if (!holidayQuery.isError) {
      for (const row of rowsOf<{
        id: string;
        dateBs: string;
        name: string;
        appliesToEmployees?: boolean;
        appliesToStudents?: boolean;
      }>(holidayQuery.data)) {
        if (!inMonth(row.dateBs)) continue;
        const applies = [
          row.appliesToStudents ? "Students" : null,
          row.appliesToEmployees ? "Employees" : null,
        ]
          .filter(Boolean)
          .join(", ");
        result.push({
          id: `holiday-${row.id}`,
          title: row.name,
          startBs: row.dateBs,
          kind: "HOLIDAY",
          meta: applies ? { "Applies to": applies } : undefined,
        });
      }
    }

    // TERM (admin)
    if (!termQuery.isError) {
      for (const row of rowsOf<{
        id: string;
        name?: string;
        termNumber?: number;
        startDateBs?: string | null;
        endDateBs?: string | null;
      }>(termQuery.data)) {
        if (!overlapsMonth(row.startDateBs, row.endDateBs)) continue;
        result.push({
          id: `term-${row.id}`,
          title: row.name || (row.termNumber ? `Term ${row.termNumber}` : "Term"),
          startBs: row.startDateBs ?? "",
          endBs: row.endDateBs ?? undefined,
          kind: "TERM",
        });
      }
    }

    // FEE_DUE (accountant)
    if (!installmentQuery.isError) {
      for (const row of rowsOf<{
        id: string;
        installmentNo?: number;
        dueDateBs: string;
        amount?: string | number;
        studentFeeItem?: { feeHead?: { name?: string; code?: string } | null } | null;
      }>(installmentQuery.data)) {
        if (!inMonth(row.dueDateBs)) continue;
        result.push({
          id: `installment-${row.id}`,
          title:
            row.studentFeeItem?.feeHead?.name ||
            row.studentFeeItem?.feeHead?.code ||
            "Fee installment",
          startBs: row.dueDateBs,
          kind: "FEE_DUE",
          meta: {
            ...(row.installmentNo ? { Installment: String(row.installmentNo) } : {}),
            ...(row.amount !== undefined ? { Amount: String(row.amount) } : {}),
          },
        });
      }
    }

    // EXAM (teacher): exam windows + per-subject exam dates
    if (!examQuery.isError) {
      for (const row of rowsOf<{
        id: string;
        name?: string;
        examName?: string;
        startDateBs?: string | null;
        endDateBs?: string | null;
      }>(examQuery.data)) {
        if (!overlapsMonth(row.startDateBs, row.endDateBs)) continue;
        result.push({
          id: `exam-${row.id}`,
          title: row.examName || row.name || "Exam",
          startBs: row.startDateBs ?? "",
          endBs: row.endDateBs ?? undefined,
          kind: "EXAM",
        });
      }
    }
    if (!examSubjectQuery.isError) {
      for (const row of rowsOf<{
        id: string;
        examDateBs?: string | null;
        exam?: { name?: string } | null;
        teachingAssignment?: {
          batchTermSubject?: {
            subject?: { name?: string; code?: string } | null;
            batchTerm?: { name?: string | null; batch?: { name?: string } | null } | null;
          } | null;
        } | null;
        batchTermSubject?: {
          subject?: { name?: string; code?: string } | null;
          batchTerm?: { name?: string | null; batch?: { name?: string } | null } | null;
        } | null;
      }>(examSubjectQuery.data)) {
        if (!inMonth(row.examDateBs)) continue;
        const subject =
          row.teachingAssignment?.batchTermSubject?.subject ??
          row.batchTermSubject?.subject;
        const batch =
          row.teachingAssignment?.batchTermSubject?.batchTerm?.batch?.name ??
          row.batchTermSubject?.batchTerm?.batch?.name;
        result.push({
          id: `exam-subject-${row.id}`,
          title: [subject?.name ?? subject?.code, batch].filter(Boolean).join(" — ") || "Exam",
          startBs: row.examDateBs ?? "",
          kind: "EXAM",
          meta: row.exam?.name ? { Exam: row.exam.name } : undefined,
        });
      }
    }

    // CLASS (teacher's own sessions)
    if (!sessionQuery.isError) {
      for (const row of rowsOf<{
        id: string;
        dateBs?: string;
        teachingAssignment?: {
          batchTermSubject?: {
            subject?: { name?: string; code?: string } | null;
            batchTerm?: { name?: string | null; batch?: { name?: string } | null } | null;
          } | null;
        } | null;
        period?: { name?: string; startTime?: string; endTime?: string } | null;
      }>(sessionQuery.data)) {
        if (!inMonth(row.dateBs)) continue;
        const subject = row.teachingAssignment?.batchTermSubject?.subject;
        const batch = row.teachingAssignment?.batchTermSubject?.batchTerm?.batch?.name;
        result.push({
          id: `session-${row.id}`,
          title: [subject?.name ?? subject?.code, batch].filter(Boolean).join(" — ") || "Class",
          startBs: row.dateBs ?? "",
          startTime: row.period?.startTime,
          endTime: row.period?.endTime,
          kind: "CLASS",
          meta: row.period?.name ? { Period: row.period.name } : undefined,
        });
      }
    }

    // NOTICE (expiresOnBs deadline)
    if (!noticeQuery.isError) {
      const rows = rowsOf<{
        id: string;
        title: string;
        expiresOnBs?: string | null;
        isPublished?: boolean;
        published?: boolean;
      }>(noticeQuery.data);
      for (const row of rows) {
        const expires = (row as { expiresOnBs?: string | null }).expiresOnBs;
        if (!inMonth(expires)) continue;
        result.push({
          id: `notice-${row.id}`,
          title: row.title,
          startBs: expires ?? "",
          kind: "NOTICE",
        });
      }
    }

    // ATTENDANCE (staff own record)
    if (!attendanceQuery.isError) {
      for (const row of rowsOf<{
        id: string;
        dateBs: string;
        status: string;
        leaveType?: { name?: string; code?: string } | null;
      }>(attendanceQuery.data)) {
        if (!inMonth(row.dateBs)) continue;
        result.push({
          id: `attendance-${row.id}`,
          title: row.status,
          startBs: row.dateBs,
          kind: "ATTENDANCE",
          status: row.status,
          meta: row.leaveType?.name ? { "Leave type": row.leaveType.name } : undefined,
        });
      }
    }

    return result;
  }, [
    attendanceQuery.data,
    attendanceQuery.isError,
    examQuery.data,
    examQuery.isError,
    examSubjectQuery.data,
    examSubjectQuery.isError,
    holidayQuery.data,
    holidayQuery.isError,
    installmentQuery.data,
    installmentQuery.isError,
    monthEnd,
    monthStart,
    noticeQuery.data,
    noticeQuery.isError,
    sessionQuery.data,
    sessionQuery.isError,
    termQuery.data,
    termQuery.isError,
  ]);

  return {
    events,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && events.length === 0,
    roleKinds,
    errors,
  };
}

export default useCalendarEvents;
