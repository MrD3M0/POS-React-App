/**
 * Bikram Sambat (BS) <-> Gregorian (AD) utilities.
 *
 * BS month lengths (29-32 days) are published by Nepal's calendar committee and
 * cannot be derived from a formula, so conversion is table driven.
 * Table covers BS 2001-2095 (AD 1944-04-13 .. 2039-04-13).
 *
 * Epoch: BS 2001-01-01 === AD 1944-04-13.
 *
 * Form value format used by <BsDatePicker />: BS string "YYYY-MM-DD" (e.g. "2081-05-14"),
 * or "" when empty.
 */

export const BS_MIN_YEAR = 2001;
export const BS_MAX_YEAR = 2095;

export interface BsDate {
  year: number;
  /** 1-12 (1 = Baisakh) */
  month: number;
  day: number;
}

export type BsLang = "en" | "ne";

// Days in each month [Baisakh ... Chaitra]
const BS_MONTH_DAYS: Readonly<Record<number, readonly number[]>> = {
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2085: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2086: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2087: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2088: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2090: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2091: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2092: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2093: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2094: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2095: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
};

const DAY_MS = 86_400_000;
/** AD 1944-04-13 === BS 2001-01-01 */
const EPOCH_UTC = Date.UTC(1944, 3, 13);
const EPOCH_WEEKDAY = new Date(EPOCH_UTC).getUTCDay(); // 0 = Sunday

// Day offset (from epoch) at which each BS year starts, and total supported days.
const { YEAR_START, TOTAL_DAYS } = (() => {
  const map = new Map<number, number>();
  let acc = 0;
  for (let y = BS_MIN_YEAR; y <= BS_MAX_YEAR; y++) {
    map.set(y, acc);
    acc += BS_MONTH_DAYS[y].reduce((a, b) => a + b, 0);
  }
  return { YEAR_START: map, TOTAL_DAYS: acc };
})();

// ---------------------------------------------------------------------------
// Core conversion
// ---------------------------------------------------------------------------

export function getDaysInBsMonth(year: number, month: number): number {
  const row = BS_MONTH_DAYS[year];
  if (!row || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`Unsupported BS month ${year}-${month}`);
  }
  return row[month - 1];
}

export function isValidBsDate({ year, month, day }: BsDate): boolean {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  )
    return false;
  if (year < BS_MIN_YEAR || year > BS_MAX_YEAR || month < 1 || month > 12)
    return false;
  return day >= 1 && day <= getDaysInBsMonth(year, month);
}

function bsToOffset({ year, month, day }: BsDate): number {
  const row = BS_MONTH_DAYS[year];
  let offset = YEAR_START.get(year)!;
  for (let m = 0; m < month - 1; m++) offset += row[m];
  return offset + (day - 1);
}

/** BS -> AD. Returns a local-midnight Date. Throws RangeError if the BS date is invalid. */
export function bsToAd(date: BsDate): Date {
  if (!isValidBsDate(date)) {
    throw new RangeError(`Invalid or unsupported BS date ${formatBs(date)}`);
  }
  const u = new Date(EPOCH_UTC + bsToOffset(date) * DAY_MS);
  return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate());
}

/** AD -> BS (uses the Date's local year/month/day). Throws RangeError outside table range. */
export function adToBs(date: Date): BsDate {
  const offset = Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      EPOCH_UTC) /
      DAY_MS,
  );
  if (offset < 0 || offset >= TOTAL_DAYS) {
    throw new RangeError("Date is outside supported BS range (2001-2095)");
  }
  let year = BS_MAX_YEAR;
  while (YEAR_START.get(year)! > offset) year--;
  let rem = offset - YEAR_START.get(year)!;
  const row = BS_MONTH_DAYS[year];
  let m = 0;
  while (rem >= row[m]) {
    rem -= row[m];
    m++;
  }
  return { year, month: m + 1, day: rem + 1 };
}

/** Weekday of the 1st of a BS month. 0 = Sunday ... 6 = Saturday. */
export function getBsMonthStartWeekday(year: number, month: number): number {
  return (EPOCH_WEEKDAY + bsToOffset({ year, month, day: 1 })) % 7;
}

/** Today's BS date in Nepal time (Asia/Kathmandu), regardless of the browser's timezone. */
export function todayBs(): BsDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return adToBs(new Date(get("year"), get("month") - 1, get("day")));
}

// ---------------------------------------------------------------------------
// Parsing / formatting / comparing
// ---------------------------------------------------------------------------

const BS_STRING_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

/** "2081-05-14" -> BsDate, or null when empty/malformed/invalid. */
export function parseBs(value: string | null | undefined): BsDate | null {
  if (!value) return null;
  const m = BS_STRING_RE.exec(value.trim());
  if (!m) return null;
  const date = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  return isValidBsDate(date) ? date : null;
}

/** Handy for zod `.refine()`. */
export function isBsDateString(value: string | null | undefined): boolean {
  return parseBs(value) !== null;
}

/** BsDate -> "YYYY-MM-DD" */
export function formatBs({ year, month, day }: BsDate): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function compareBs(a: BsDate, b: BsDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

// ---------------------------------------------------------------------------
// Names / display
// ---------------------------------------------------------------------------

export const BS_MONTHS_EN = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export const BS_MONTHS_NE = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
] as const;

export const BS_WEEKDAYS_EN = [
  "Su",
  "Mo",
  "Tu",
  "We",
  "Th",
  "Fr",
  "Sa",
] as const;
export const BS_WEEKDAYS_NE = [
  "आइत",
  "सोम",
  "मंगल",
  "बुध",
  "बिही",
  "शुक्र",
  "शनि",
] as const;

export function getBsMonthName(month: number, lang: BsLang = "en"): string {
  return (lang === "ne" ? BS_MONTHS_NE : BS_MONTHS_EN)[month - 1];
}

const NE_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toNepaliDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => NE_DIGITS[Number(d)]);
}

/** Digits in the requested language. */
export function localizeDigits(
  value: string | number,
  lang: BsLang = "en",
): string {
  return lang === "ne" ? toNepaliDigits(value) : String(value);
}

/** "14 Bhadra 2081" / "१४ भदौ २०८१" */
export function formatBsLong(date: BsDate, lang: BsLang = "en"): string {
  return `${localizeDigits(date.day, lang)} ${getBsMonthName(date.month, lang)} ${localizeDigits(date.year, lang)}`;
}
