"use client";

import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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

const NE_DIGITS = "०१२३४५६७८९";
const localizeStr = (s: string, lang: BsLang) =>
  lang === "ne" ? s.replace(/\d/g, (d) => NE_DIGITS[Number(d)]) : s;

const pad2 = (n: number) => String(n).padStart(2, "0");

/** true below the Tailwind `sm` breakpoint (640px). SSR-safe: false on first render. */
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

export interface BsDateTimePickerProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "value" | "onChange" | "onBlur" | "children" | "type" | "placeholder"
  > {
  /**
   * Either a BS datetime string "YYYY-MM-DD HH:mm" (24h; "YYYY-MM-DD" alone = 00:00)
   * or a JS `Date` (AD). Empty: "" / undefined / null.
   */
  value?: string | Date | null;
  /**
   * Emits a BS string "YYYY-MM-DD HH:mm" (cleared: ""), or a JS `Date` (cleared: undefined)
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
  /** Earliest selectable date (date-level, time ignored): BS string or JS Date. */
  minDate?: string | Date;
  /** Latest selectable date (date-level, time ignored): BS string or JS Date. */
  maxDate?: string | Date;
  /** Show a "Clear" button when a value is selected. Default true. */
  clearable?: boolean;
  /** Show the AD equivalent of the selected datetime. Default true. */
  showAd?: boolean;
  "aria-invalid"?: boolean;
}

export const BsDateTimePicker = React.forwardRef<HTMLButtonElement, BsDateTimePickerProps>(
  function BsDateTimePicker(
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
      "aria-invalid": ariaInvalid,
      ...buttonProps
    },
    ref,
  ) {
    const [open, setOpen] = React.useState(false);
    const isMobile = useIsMobile();

    // Date objects are compared by timestamp so a new-but-equal Date doesn't recompute.
    const valueKey = value instanceof Date ? value.getTime() : value;
    const minKey = minDate instanceof Date ? minDate.getTime() : minDate;
    const maxKey = maxDate instanceof Date ? maxDate.getTime() : maxDate;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const parsed = React.useMemo(() => toBsDateTime(value), [valueKey]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const minBound = React.useMemo(() => toBsDateTime(minDate).date, [minKey]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const maxBound = React.useMemo(() => toBsDateTime(maxDate).date, [maxKey]);

    const selected = parsed.date;
    const hours24 = parsed.hours; // 0-23
    const minutes = parsed.minutes; // 0-59
    const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const isPm = hours24 >= 12;

    const emit = (d: BsDate | null, h = 0, m = 0) => {
      const asAd = valueFormat ? valueFormat === "ad" : value instanceof Date;
      if (d === null) {
        onChange?.(asAd ? undefined : "");
        return;
      }
      if (asAd) {
        const ad = bsToAd(d);
        const out = new Date(ad);
        out.setHours(h, m, 0, 0);
        onChange?.(out);
      } else {
        onChange?.(`${formatBs(d)} ${pad2(h)}:${pad2(m)}`);
      }
    };

    const low: View = React.useMemo(
      () => (minBound ? { year: minBound.year, month: minBound.month } : { year: BS_MIN_YEAR, month: 1 }),
      [minBound],
    );
    const high: View = React.useMemo(() => {
      const h = maxBound ? { year: maxBound.year, month: maxBound.month } : { year: BS_MAX_YEAR, month: 12 };
      // Guard against an inverted min/max range.
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

    // Picking a date keeps the popover open so the user can set the time next.
    const selectDate = (d: BsDate) => {
      emit(d, hours24, minutes);
    };

    const setTime = (type: "hour" | "minute" | "ampm", v: number | "AM" | "PM") => {
      let h = hours24;
      let m = minutes;
      if (type === "hour") h = ((v as number) % 12) + (isPm ? 12 : 0);
      else if (type === "minute") m = v as number;
      else h = (hours24 % 12) + (v === "PM" ? 12 : 0);

      // No date yet -> fall back to today (or nearest allowed date).
      let base = selected ?? today;
      if (!selected && isDisabled(base)) {
        base = minBound && compareBs(base, minBound) < 0 ? minBound : (maxBound ?? base);
      }
      emit(base, h, m);
    };

    const goNow = () => {
      const now = new Date();
      emit(today, now.getHours(), now.getMinutes());
      setView(clampView({ year: today.year, month: today.month }));
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
      placeholder ?? (lang === "ne" ? "मिति र समय छान्नुहोस्" : "Select date & time (BS)");

    const timeLabel = (h24: number, m: number) =>
      localizeStr(`${pad2(h24 % 12 === 0 ? 12 : h24 % 12)}:${pad2(m)} ${h24 >= 12 ? "PM" : "AM"}`, lang);

    const trigger = (
          <Button
            ref={ref}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              ariaInvalid && "border-destructive",
              className,
            )}
            {...buttonProps}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {selected ? (
              <span className="truncate">
                {formatBsLong(selected, lang)}, {timeLabel(hours24, minutes)}
              </span>
            ) : (
              <span>{resolvedPlaceholder}</span>
            )}
          </Button>
    );

    const panel = (
      <>
          <div className="sm:flex">
            {/* ---------- Calendar ---------- */}
            <div className="p-3">
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
                      onClick={() => selectDate(date)}
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
            </div>

            {/* ---------- Time columns ---------- */}
            <div className="flex flex-col divide-y border-t sm:h-auto sm:max-h-[340px] sm:flex-row sm:divide-x sm:divide-y-0 sm:border-l sm:border-t-0">
              {/* Hours (12h) */}
              <ScrollArea className="w-full sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <Button
                      key={h}
                      type="button"
                      size="icon"
                      variant={selected && hour12 === h ? "primary" : "ghost"}
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() => setTime("hour", h)}
                      aria-label={`Hour ${h}`}
                    >
                      {localizeStr(pad2(h), lang)}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>

              {/* Minutes */}
              <ScrollArea className="w-full sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <Button
                      key={m}
                      type="button"
                      size="icon"
                      variant={selected && minutes === m ? "primary" : "ghost"}
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() => setTime("minute", m)}
                      aria-label={`Minute ${m}`}
                    >
                      {localizeStr(pad2(m), lang)}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>

              {/* AM / PM */}
              <div className="flex p-2 sm:flex-col">
                {(["AM", "PM"] as const).map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="icon"
                    variant={selected && (p === "PM") === isPm ? "primary" : "ghost"}
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() => setTime("ampm", p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* ---------- Footer ---------- */}
          <div className="flex items-center justify-between gap-2 border-t p-3">
            <div className="text-xs text-muted-foreground">
              {showAd && selected ? (
                <>
                  AD: {formatAd(selected)} {pad2(hours24)}:{pad2(minutes)}
                </>
              ) : null}
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
                onClick={goNow}
              >
                {lang === "ne" ? "अहिले" : "Now"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => {
                  setOpen(false);
                  onBlur?.();
                }}
              >
                {lang === "ne" ? "ठीक छ" : "Done"}
              </Button>
            </div>
          </div>
      </>
    );

    // Mobile (< sm): centered dialog. Desktop: popover anchored to the trigger.
    if (isMobile) {
      return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] max-w-[340px] gap-0 overflow-y-auto p-0">
            <DialogTitle className="sr-only">
              {lang === "ne" ? "मिति र समय छान्नुहोस्" : "Select date & time (BS)"}
            </DialogTitle>
            {panel}
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {panel}
        </PopoverContent>
      </Popover>
    );
  },
);

type ParsedBsDateTime = { date: BsDate | null; hours: number; minutes: number };

/**
 * BS string ("YYYY-MM-DD" or "YYYY-MM-DD HH:mm") or JS Date (AD) -> BS date + 24h time.
 * date is null when empty, invalid, or outside the supported BS range.
 */
function toBsDateTime(v: string | Date | null | undefined): ParsedBsDateTime {
  const empty: ParsedBsDateTime = { date: null, hours: 0, minutes: 0 };

  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return empty;
    try {
      return { date: adToBs(v), hours: v.getHours(), minutes: v.getMinutes() };
    } catch {
      return empty;
    }
  }

  if (!v) return empty;
  const [datePart, timePart] = v.trim().split(/[ T]/);
  const date = parseBs(datePart);
  if (!date) return empty;

  let hours = 0;
  let minutes = 0;
  const m = timePart?.match(/^(\d{1,2}):(\d{2})/);
  if (m) {
    const h = Number(m[1]);
    const mi = Number(m[2]);
    if (h >= 0 && h <= 23 && mi >= 0 && mi <= 59) {
      hours = h;
      minutes = mi;
    }
  }
  return { date, hours, minutes };
}

function formatAd(d: BsDate): string {
  const ad = bsToAd(d);
  const y = ad.getFullYear();
  const m = String(ad.getMonth() + 1).padStart(2, "0");
  const day = String(ad.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// (bs-date helpers live in "@/lib/bs-date" — import from there directly;
// re-exporting them here would break react-refresh.)