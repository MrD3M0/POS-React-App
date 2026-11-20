/**
 * BS date-range helpers used by the holidays multi-day picker.
 * All functions take/return BS strings "YYYY-MM-DD" (zero-padded, so plain
 * string comparison is chronological) and build on the table-driven
 * conversion in "@/lib/bs-date".
 */

import { adToBs, bsToAd, compareBs, parseBs, type BsDate } from "@/lib/bs-date";

/** AD weekday of a BS date. 0 = Sunday ... 6 = Saturday. Throws on invalid input. */
export function bsWeekdayOf(dateBs: string): number {
  const parsed = requireBsDate(dateBs);
  return bsToAd(parsed).getDay();
}

/**
 * Every BS date (inclusive, ascending) between fromBs and toBs.
 * Throws when either endpoint is invalid or when toBs < fromBs.
 */
export function enumerateBsDateRange(fromBs: string, toBs: string): string[] {
  const from = requireBsDate(fromBs);
  const to = requireBsDate(toBs);
  if (compareBs(from, to) > 0) {
    throw new RangeError(`toBs (${toBs}) is before fromBs (${fromBs})`);
  }

  const dates: string[] = [];
  let cursor = bsToAd(from);
  const end = bsToAd(to);
  while (cursor.getTime() <= end.getTime()) {
    dates.push(formatBsDate(adToBs(cursor)));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
  }
  return dates;
}

/** Keeps only the dates whose AD weekday is in `weekdays` (0=Sun..6=Sat). */
export function filterBsDatesByWeekdays(
  dates: readonly string[],
  weekdays: readonly number[],
): string[] {
  const wanted = new Set(weekdays);
  if (wanted.size === 0) return [];
  return dates.filter((dateBs) => wanted.has(bsWeekdayOf(dateBs)));
}

/** Removes duplicates and returns the dates sorted ascending. */
export function dedupeBsDates(dates: readonly string[]): string[] {
  return [...new Set(dates)].sort((a, b) => a.localeCompare(b));
}

function requireBsDate(value: string): BsDate {
  const parsed = parseBs(value);
  if (!parsed) {
    throw new RangeError(`Invalid BS date ${value} (expected a real YYYY-MM-DD date)`);
  }
  return parsed;
}

function formatBsDate({ year, month, day }: BsDate): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
