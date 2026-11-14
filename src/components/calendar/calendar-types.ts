/**
 * Shared types and metadata for the BS event calendar.
 * Kept out of the component file so it stays a pure component module
 * (react-refresh rule) and so hooks/pages can import without the calendar.
 */
import {
  compareBs,
  formatBsLong,
  parseBs,
  type BsLang,
} from "@/lib/bs-date";

export type T_CalendarEventKind =
  | "HOLIDAY"
  | "EXAM"
  | "TERM"
  | "FEE_DUE"
  | "CLASS"
  | "ATTENDANCE"
  | "NOTICE";

export type T_CalendarEvent = {
  id: string;
  title: string;
  /** BS "YYYY-MM-DD" */
  startBs: string;
  /** BS "YYYY-MM-DD" (inclusive); omit for single-day events */
  endBs?: string;
  /** "HH:mm" */
  startTime?: string;
  /** "HH:mm" */
  endTime?: string;
  kind: T_CalendarEventKind;
  status?: string;
  href?: string;
  meta?: Record<string, string>;
};

/** One token-class map for every kind — no hardcoded hex anywhere. */
export const CALENDAR_KIND_META: Record<
  T_CalendarEventKind,
  { label: string; chip: string; dot: string }
> = {
  HOLIDAY: {
    label: "Holiday",
    chip: "bg-red-500/12 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    dot: "bg-red-500",
  },
  EXAM: {
    label: "Exam",
    chip: "bg-violet-500/12 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  TERM: {
    label: "Term",
    chip: "bg-blue-500/12 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  FEE_DUE: {
    label: "Fee due",
    chip: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  CLASS: {
    label: "Class",
    chip: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  ATTENDANCE: {
    label: "Attendance",
    chip: "bg-teal-500/12 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
    dot: "bg-teal-500",
  },
  NOTICE: {
    label: "Notice",
    chip: "bg-muted text-foreground",
    dot: "bg-muted-foreground",
  },
};

/** BS month arithmetic used by the toolbar arrows (handles Chaitra → Baisakh). */
export function shiftBsMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  const y = Math.floor(total / 12);
  return { year: y, month: total - y * 12 + 1 };
}

/** Shared display helper used by the calendar and its pages. */
export function calendarEventDateLabel(
  event: T_CalendarEvent,
  lang: BsLang,
): string {
  const start = parseBs(event.startBs);
  if (!start) return event.startBs;
  const end = parseBs(event.endBs);
  if (end && compareBs(end, start) > 0) {
    return `${formatBsLong(start, lang)} → ${formatBsLong(end, lang)}`;
  }
  return formatBsLong(start, lang);
}
