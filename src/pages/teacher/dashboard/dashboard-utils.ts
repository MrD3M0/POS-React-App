import { isBsDateString, parseBs, formatBs } from "@/lib/bs-date";

/** "Subject - Class/Section" label used across the dashboard widgets. */
export function subjectClassLabel(
  subjectName: string,
  classLabel: string,
): string {
  if (!subjectName) return classLabel || "—";
  if (!classLabel) return subjectName;
  return `${subjectName} - ${classLabel}`;
}

/** BS date (YYYY-MM-DD) -> short readable label, e.g. "2083-07-25". */
export function shortBsDate(dateBs: string | null | undefined): string {
  if (!dateBs || !isBsDateString(dateBs)) return "—";
  const parsed = parseBs(dateBs);
  return parsed ? formatBs(parsed) : dateBs;
}

/** "07:00 – 07:45" or "—" when the period has no times. */
export function periodTimeLabel(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): string {
  if (!startTime && !endTime) return "—";
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  return (startTime ?? endTime) as string;
}

/** Percentage with one decimal, e.g. "72.4%". */
export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)}%`;
}

/** Marks without trailing zeros, e.g. 72.5 -> "72.5", 70 -> "70". */
export function formatMarks(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Signed difference between two percentages, e.g. "+3.2%". */
export function formatTrend(current: number, previous: number): string {
  const diff = Math.round((current - previous) * 10) / 10;
  if (diff === 0) return "no change";
  return `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`;
}
