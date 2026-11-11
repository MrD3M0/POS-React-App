import { AlarmClock, Check, Clock, X, type LucideIcon } from "lucide-react";

export const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "LEAVE",
  "LATE",
] as const;

export type TAttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export type TAttendanceCounts = Record<TAttendanceStatus, number>;

export type TAttendanceStatusMeta = {
  /** Sentence-case label used in every view. */
  label: string;
  /** Single letter used by the compact P/A/L/H controls. */
  short: string;
  icon: LucideIcon;
  /** Tinted chip / badge classes. */
  chipClass: string;
  /** Selected round-button classes (mobile). */
  buttonClass: string;
  /** Stat tile classes. */
  tileClass: string;
};

/** Single source of truth for labels, icons and colours. Works in dark mode. */
export const ATTENDANCE_STATUS_META: Record<
  TAttendanceStatus,
  TAttendanceStatusMeta
> = {
  PRESENT: {
    label: "Present",
    short: "P",
    icon: Check,
    chipClass:
      "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    buttonClass:
      "border-emerald-600/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    tileClass:
      "border-emerald-600/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  },
  ABSENT: {
    label: "Absent",
    short: "A",
    icon: X,
    chipClass: "border-destructive/30 bg-destructive/10 text-destructive",
    buttonClass: "border-destructive/40 bg-destructive/15 text-destructive",
    tileClass: "border-destructive/20 bg-destructive/5 text-destructive",
  },
  LEAVE: {
    label: "Leave",
    short: "L",
    icon: Clock,
    chipClass:
      "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    buttonClass:
      "border-amber-600/40 bg-amber-500/15 text-amber-700 dark:text-amber-400",
    tileClass:
      "border-amber-600/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  },
  LATE: {
    label: "Late",
    short: "Lt",
    icon: AlarmClock,
    chipClass:
      "border-blue-600/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    buttonClass:
      "border-blue-600/40 bg-blue-500/15 text-blue-700 dark:text-blue-400",
    tileClass:
      "border-blue-600/20 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  },
};

export const INACTIVE_STATUS_BUTTON_CLASS =
  "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground";

export function isAttendanceStatus(value: unknown): value is TAttendanceStatus {
  return (
    typeof value === "string" &&
    (ATTENDANCE_STATUSES as readonly string[]).includes(value)
  );
}

export function emptyAttendanceCounts(): TAttendanceCounts {
  return { PRESENT: 0, ABSENT: 0, LEAVE: 0, LATE: 0 };
}
