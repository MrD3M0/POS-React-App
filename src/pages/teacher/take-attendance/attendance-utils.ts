import { formatBsLong, isBsDateString, parseBs } from "@/lib/bs-date";
import type {
  T_PERIOD,
  T_ROSTER_STUDENT,
  T_TEACHER_ASSIGNMENT,
} from "./service/service";

export function studentFullName(student: T_ROSTER_STUDENT): string {
  return [student.firstName, student.middleName, student.lastName]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .trim();
}

export function studentInitials(student: T_ROSTER_STUDENT): string {
  const first = student.firstName?.trim().charAt(0) ?? "";
  const last = student.lastName?.trim().charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || "?";
}

export function assignmentLabel(assignment: T_TEACHER_ASSIGNMENT): string {
  const batch = assignment.batchTermSubject?.batchTerm?.batch?.name;
  const term = assignment.batchTermSubject?.batchTerm?.name;
  const subject =
    assignment.batchTermSubject?.subject?.name ??
    assignment.batchTermSubject?.subject?.code;
  return [batch, term, subject].filter(Boolean).join(" · ") || "Unnamed class";
}

export function assignmentSubjectLabel(assignment: T_TEACHER_ASSIGNMENT | null): string {
  if (!assignment) return "";
  return assignment.batchTermSubject?.subject?.name ?? "Class";
}

export function periodLabel(period: T_PERIOD): string {
  const name = period.name ?? `Period ${period.periodNumber ?? ""}`.trim();
  if (period.startTime && period.endTime) return `${name} · ${period.startTime}–${period.endTime}`;
  return name;
}

export function formatBsDate(value: string): string {
  if (!isBsDateString(value)) return value;
  const parsed = parseBs(value);
  return parsed ? formatBsLong(parsed) : value;
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export type T_AttendanceView = "list" | "swipe";

const ATTENDANCE_VIEW_STORAGE_KEY = "college-ms:teacher:take-attendance:view";

export function readStoredAttendanceView(): T_AttendanceView {
  if (typeof window === "undefined") return "list";
  return window.localStorage.getItem(ATTENDANCE_VIEW_STORAGE_KEY) === "swipe"
    ? "swipe"
    : "list";
}

export function storeAttendanceView(view: T_AttendanceView): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ATTENDANCE_VIEW_STORAGE_KEY, view);
}
