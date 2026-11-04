"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_WEEKDAYS_EN,
  BS_WEEKDAYS_NE,
  adToBs,
  bsToAd,
  compareBs,
  formatBs,
  formatBsLong,
  getBsMonthName,
  getBsMonthStartWeekday,
  getDaysInBsMonth,
  localizeDigits,
  parseBs,
  todayBs,
  type BsDate,
  type BsLang,
} from "@/lib/bs-date";
import Button from "./ui/button";

type View = { year: number; month: number };

const ymIndex = (v: View) => v.year * 12 + (v.month - 1);

export interface BsDatePickerProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "value" | "onChange" | "onBlur" | "children" | "type" | "placeholder"
  > {
  /**
   * Either a BS date string "YYYY-MM-DD" or a JS `Date` (AD).
   * Empty: "" / undefined / null.
   */
  value?: string | Date | null;
  /**
   * Emits a BS string "YYYY-MM-DD" (cleared: ""), or a JS `Date` (cleared: undefined)
   * when `valueFormat="ad"` or when the current `value` is a Date.
   */
  onChange?: (value: string | Date | undefined) => void;
  onBlur?: () => void;
  /**
   * What onChange emits. "bs" = BS string, "ad" = JS Date.
   * Default: "ad" if `value` is currently a Date, otherwise "bs".
   * If your form field type is `Date | undefined` (e.g. z.date()), pass valueFormat="ad".
   */
  valueFormat?: "bs" | "ad";
  placeholder?: string;
  /** "en" = Roman month names + digits, "ne" = Devanagari. */
  lang?: BsLang;
  /** Earliest selectable date: BS string "YYYY-MM-DD" or a JS Date. */
  minDate?: string | Date;
  /** Latest selectable date: BS string "YYYY-MM-DD" or a JS Date. */
  maxDate?: string | Date;
  /** Show a "Clear" button when a date is selected. Default true. */
  clearable?: boolean;
  /** Show the AD equivalent of the selected date. Default true. */
  showAd?: boolean;
}

export const BsDatePicker = React.forwardRef<HTMLButtonElement, BsDatePickerProps>(
  function BsDatePicker(
    {
      value,
      onChange,
      onBlur,
      valueFormat,
      placeholder,
      lang = "en",
      minDate,
      maxDate,
      clearable = true,
      showAd = true,
      className,
      disabled,
      ...buttonProps
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false);

    // Date objects are compared by timestamp so a new-but-equal Date doesn't recompute.
    const valueKey = value instanceof Date ? value.getTime() : value;
    const minKey = minDate instanceof Date ? minDate.getTime() : minDate;
    const maxKey = maxDate instanceof Date ? maxDate.getTime() : maxDate;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selected = React.useMemo(() => toBs(value), [valueKey]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const minBound = React.useMemo(() => toBs(minDate), [minKey]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const maxBound = React.useMemo(() => toBs(maxDate), [maxKey]);

    const emit = (d: BsDate | null) => {
      const asAd = valueFormat ? valueFormat === "ad" : value instanceof Date;
      if (d === null) onChange?.(asAd ? undefined : "");
      else onChange?.(asAd ? bsToAd(d) : formatBs(d));
    };

    const low: View = React.useMemo(
      () => (minBound ? { year: minBound.year, month: minBound.month } : { year: BS_MIN_YEAR, month: 1 }),
      [minBound],
    );
    const high: View = React.useMemo(() => {
      const h = maxBound ? { year: maxBound.year, month: maxBound.month } : { year: BS_MAX_YEAR, month: 12 };
      // Guard against an inverted min/max range (e.g. start date later than the max).
      return ymIndex(h) < ymIndex(low) ? low : h;
    }, [maxBound, low]);

    const clampView = React.useCallback(
      (v: View): View => {
        if (ymIndex(v) < ymIndex(low)) return low;
        if (ymIndex(v) > ymIndex(high)) return high;
        return v;
      },
      [low, high],
    );

    const initialView = React.useCallback((): View => {
      const base = selected ?? todayBs();
      return clampView({ year: base.year, month: base.month });
    }, [selected, clampView]);

    const [view, setView] = React.useState<View>(initialView);

    const handleOpenChange = (next: boolean) => {
      setOpen(next);
      if (next) setView(initialView());
      else onBlur?.();
    };

    const today = React.useMemo(() => todayBs(), []);

    const isDisabled = (d: BsDate) =>
      (minBound !== null && compareBs(d, minBound) < 0) ||
      (maxBound !== null && compareBs(d, maxBound) > 0);

    const select = (d: BsDate) => {
      emit(d);
      setOpen(false);
      onBlur?.();
    };

    const goMonth = (delta: number) => {
      const idx = ymIndex(view) + delta;
      setView(clampView({ year: Math.floor(idx / 12), month: (idx % 12) + 1 }));
    };

    const daysInMonth = getDaysInBsMonth(view.year, view.month);
    const lead = getBsMonthStartWeekday(view.year, view.month);
    const cells: Array<number | null> = [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const years = Array.from({ length: high.year - low.year + 1 }, (_, i) => low.year + i);
    const monthStart = view.year === low.year ? low.month : 1;
    const monthEnd = view.year === high.year ? high.month : 12;
    const months = Array.from({ length: monthEnd - monthStart + 1 }, (_, i) => monthStart + i);

    const weekdays = lang === "ne" ? BS_WEEKDAYS_NE : BS_WEEKDAYS_EN;
    const resolvedPlaceholder =
      placeholder ?? (lang === "ne" ? "मिति छान्नुहोस्" : "Select date (BS)");

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              className,
            )}
            {...buttonProps}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {selected ? formatBsLong(selected, lang) : <span>{resolvedPlaceholder}</span>}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3" align="start">
          {/* Header: prev / month / year / next */}
          <div className="mb-3 flex items-center justify-between gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => goMonth(-1)}
              disabled={ymIndex(view) <= ymIndex(low)}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              <Select
                value={String(view.month)}
                onValueChange={(v) => setView(clampView({ ...view, month: Number(v) }))}
              >
                <SelectTrigger className="h-8 w-[110px] px-2 text-sm" aria-label="Month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {getBsMonthName(m, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(view.year)}
                onValueChange={(v) => setView(clampView({ ...view, year: Number(v) }))}
              >
                <SelectTrigger className="h-8 w-[90px] px-2 text-sm" aria-label="Year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {localizeDigits(y, lang)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => goMonth(1)}
              disabled={ymIndex(view) >= ymIndex(high)}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday header (week starts Sunday; Saturday is the Nepali weekly holiday) */}
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map((w, i) => (
              <div
                key={w}
                className={cn(
                  "flex h-8 w-9 items-center justify-center text-xs font-medium text-muted-foreground",
                  i === 6 && "text-destructive",
                )}
              >
                {w}
              </div>
            ))}

            {cells.map((day, idx) => {
              if (day === null) return <div key={`blank-${idx}`} className="h-9 w-9" />;

              const date: BsDate = { year: view.year, month: view.month, day };
              const isSelected = selected !== null && compareBs(date, selected) === 0;
              const isToday = compareBs(date, today) === 0;
              const isSaturday = (lead + day - 1) % 7 === 6;
              const off = isDisabled(date);

              return (
                <Button
                  key={day}
                  type="button"
                  variant={isSelected ? "primary" : "ghost"}
                  disabled={off}
                  onClick={() => select(date)}
                  aria-label={formatBsLong(date, "en")}
                  aria-pressed={isSelected}
                  className={cn(
                    "h-9 w-9 p-0 font-normal",
                    !isSelected && isSaturday && "text-destructive",
                    !isSelected && isToday && "bg-accent text-accent-foreground",
                    off && "opacity-40",
                  )}
                >
                  {localizeDigits(day, lang)}
                </Button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
            <div className="text-xs text-muted-foreground">
              {showAd && selected ? <>AD: {formatAd(selected)}</> : null}
            </div>
            <div className="flex items-center gap-1">
              {clearable && selected ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    emit(null);
                    setOpen(false);
                    onBlur?.();
                  }}
                >
                  <X className="mr-1 h-3 w-3" />
                  {lang === "ne" ? "हटाउनुहोस्" : "Clear"}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={isDisabled(today)}
                onClick={() => select(today)}
              >
                {lang === "ne" ? "आज" : "Today"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

/** BS string or JS Date (AD) -> BsDate; null when empty, invalid, or outside 2001-2095 BS. */
function toBs(v: string | Date | null | undefined): BsDate | null {
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    try {
      return adToBs(v);
    } catch {
      return null;
    }
  }
  return parseBs(v);
}

function formatAd(d: BsDate): string {
  const ad = bsToAd(d);
  const y = ad.getFullYear();
  const m = String(ad.getMonth() + 1).padStart(2, "0");
  const day = String(ad.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Re-exported for convenience in forms.
export { adToBs, bsToAd, formatBs, parseBs };