/**
 * Money formatting for the finance screens.
 *
 * Nepal uses the Indian digit grouping (1,25,000 — the last three digits,
 * then groups of two), so `Intl` with en-IN is used for the grouping.
 */

const NPR_FORMATTER = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const NPR_FORMATTER_NO_DECIMALS = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** "Rs. 1,25,000" — grouped for Nepal, decimals only when they matter. */
export function formatNpr(
  value: number | string | null | undefined,
  options: { decimals?: boolean; withRupees?: boolean } = {},
): string {
  const { decimals = false, withRupees = true } = options;
  const n = toNumber(value);
  const formatted = decimals
    ? NPR_FORMATTER.format(n)
    : NPR_FORMATTER_NO_DECIMALS.format(n);
  return withRupees ? `Rs. ${formatted}` : formatted;
}

/** Short form for chart axes: 1.2L / 25K / 1.3Cr. */
export function formatNprShort(
  value: number | string | null | undefined,
): string {
  const n = toNumber(value);
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `${(n / 10_000_000).toFixed(2)}Cr`;
  if (abs >= 100_000) return `${(n / 100_000).toFixed(2)}L`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return NPR_FORMATTER_NO_DECIMALS.format(n);
}
