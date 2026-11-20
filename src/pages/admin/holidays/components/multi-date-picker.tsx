import { useMemo, useState } from "react";
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
import Button from "@/components/ui/button";
import {
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_WEEKDAYS_EN,
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
} from "@/lib/bs-date";

type View = { year: number; month: number };

const ymIndex = (v: View) => v.year * 12 + (v.month - 1);

type MultiDatePickerProps = {
  /** Selected BS dates ("YYYY-MM-DD"). */
  value: string[];
  onChange: (dates: string[]) => void;
  onBlur?: () => void;
  /** Upper bound on the number of selectable dates (default 366). */
  maxDates?: number;
  disabled?: boolean;
};

/**
 * "Pick multiple dates" control: a BS calendar where clicking a day toggles
 * its selection (non-consecutive days welcome), plus removable chips for
 * every selected date.
 */
export default function MultiDatePicker({
  value,
  onChange,
  onBlur,
  maxDates = 366,
  disabled,
}: MultiDatePickerProps) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => todayBs(), []);
  const selected = useMemo(() => new Set(value), [value]);

  const [view, setView] = useState<View>(() => {
    const first = parseBs(value[0]) ?? today;
    return { year: first.year, month: first.month };
  });

  const toggle = (date: BsDate) => {
    const key = formatBs(date);
    if (selected.has(key)) {
      onChange(value.filter((d) => d !== key));
    } else {
      if (value.length >= maxDates) return;
      onChange([...value, key]);
    }
    onBlur?.();
  };

  const clearAll = () => {
    onChange([]);
    onBlur?.();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) onBlur?.();
  };

  const daysInMonth = getDaysInBsMonth(view.year, view.month);
  const lead = getBsMonthStartWeekday(view.year, view.month);
  const cells: Array<number | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const years = Array.from({ length: BS_MAX_YEAR - BS_MIN_YEAR + 1 }, (_, i) => BS_MIN_YEAR + i);
  const sortedValue = [...value].sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              value.length === 0 && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {value.length > 0
              ? `${value.length} date${value.length === 1 ? "" : "s"} selected`
              : "Pick dates (BS)"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-3" align="start">
          <div className="mb-3 flex items-center justify-between gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label="Previous month"
              disabled={ymIndex(view) <= ymIndex({ year: BS_MIN_YEAR, month: 1 })}
              onClick={() => setView(shiftMonth(view, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              <Select
                value={String(view.month)}
                onValueChange={(v) => setView({ ...view, month: Number(v) })}
              >
                <SelectTrigger className="h-8 w-[110px] px-2 text-sm" aria-label="Month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {getBsMonthName(m, "en")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(view.year)}
                onValueChange={(v) => setView({ ...view, year: Number(v) })}
              >
                <SelectTrigger className="h-8 w-[90px] px-2 text-sm" aria-label="Year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {localizeDigits(y, "en")}
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
              aria-label="Next month"
              disabled={ymIndex(view) >= ymIndex({ year: BS_MAX_YEAR, month: 12 })}
              onClick={() => setView(shiftMonth(view, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {BS_WEEKDAYS_EN.map((w, i) => (
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
              const key = formatBs(date);
              const isSelected = selected.has(key);
              const isToday = today !== null && compareBs(date, today) === 0;
              const isSaturday = (lead + day - 1) % 7 === 6;
              const atCap = !isSelected && value.length >= maxDates;

              return (
                <Button
                  key={day}
                  type="button"
                  variant={isSelected ? "primary" : "ghost"}
                  disabled={atCap}
                  onClick={() => toggle(date)}
                  aria-label={formatBsLong(date, "en")}
                  aria-pressed={isSelected}
                  className={cn(
                    "h-9 w-9 p-0 font-normal",
                    !isSelected && isSaturday && "text-destructive",
                    !isSelected && isToday && "bg-accent text-accent-foreground",
                    atCap && "opacity-40",
                  )}
                >
                  {localizeDigits(day, "en")}
                </Button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Click days to toggle selection ({value.length}/{maxDates})
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={value.length === 0}
              onClick={clearAll}
            >
              Clear all
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {sortedValue.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {sortedValue.map((dateBs) => {
            const parsed = parseBs(dateBs);
            return (
              <span
                key={dateBs}
                className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-xs"
              >
                {parsed ? formatBsLong(parsed, "en") : dateBs}
                <button
                  type="button"
                  aria-label={`Remove ${dateBs}`}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
                  onClick={() => onChange(value.filter((d) => d !== dateBs))}
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function shiftMonth(v: View, delta: number): View {
  const idx = ymIndex(v) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}
