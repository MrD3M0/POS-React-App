/**
 * BS (Bikram Sambat) event calendar.
 *
 * Adapted from the free Paragon UI "Event Calendar" shadcn registry component
 * (https://www.paragon-ui.com/docs/event-calendar — single-file registry
 * component). The layout, toolbar, chip anatomy, "+N more" popover and
 * day-cell classes follow the original; the date engine is swapped from
 * Gregorian `Date` math to our BS utilities (`src/lib/bs-date.ts`) because a
 * month grid must follow BS months (Baisakh…Chaitra, 29–32 days), which no
 * Gregorian component can render.
 *
 * Dropped from the original: `motion/react` month-slide animations (would add
 * a new npm dependency — forbidden by DECISIONS.md). Added for our needs:
 * BS year/month selects, per-kind calendar filter, Agenda view (forced below
 * `md`), keyboard day navigation, Saturday (weekly off) and holiday tinting,
 * multi-day event chips on every covered day, and an optional whole-day
 * click target for pages that can create.
 *
 * Read-only: no drag, resize or create-by-drag — events come from existing
 * records. Shared types/metadata live in `./calendar-types`.
 */
import {
  useMemo,
  useRef,
  useState,
  useCallback,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_WEEKDAYS_EN,
  BS_WEEKDAYS_NE,
  compareBs,
  formatBs,
  formatBsLong,
  getBsMonthName,
  getBsMonthStartWeekday,
  getDaysInBsMonth,
  localizeDigits,
  parseBs,
  todayBs,
  type BsLang,
} from "@/lib/bs-date";
import {
  CALENDAR_KIND_META,
  shiftBsMonth,
  type T_CalendarEvent,
  type T_CalendarEventKind,
} from "./calendar-types";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SelectCommand from "@/components/common/select-command";

// ─── Component ───────────────────────────────────────────────────────────────

type CalendarView = "month" | "agenda";

interface DayModel {
  dateBs: string;
  day: number;
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  isToday: boolean;
  /** Day belongs to the visible BS month (false = padding from a neighbor month). */
  isOutside: boolean;
  isHoliday: boolean;
  events: T_CalendarEvent[];
}

interface BsEventCalendarProps {
  events: T_CalendarEvent[];
  /** BS year, clamped to BS_MIN_YEAR..BS_MAX_YEAR by the caller. */
  year: number;
  /** BS month 1-12 (1 = Baisakh). */
  month: number;
  onMonthChange: (year: number, month: number) => void;
  /** Base set of kinds this page/role may show; defaults to the kinds present in `events`. */
  kindFilter?: T_CalendarEventKind[];
  /**
   * Takes over event clicks when provided (the built-in dialog is skipped).
   * Otherwise a read-only dialog opens with the event details.
   */
  onEventClick?: (event: T_CalendarEvent) => void;
  /** Only for pages that can create: fired with the clicked day's BS date. */
  onDayClick?: (dateBs: string) => void;
  isLoading?: boolean;
  /** Extra footer actions inside the built-in event dialog (e.g. Delete). */
  renderEventActions?: (event: T_CalendarEvent, closeDialog: () => void) => ReactNode;
  lang?: BsLang;
  /** Visible chips per day before collapsing into "+N more". */
  maxVisibleEvents?: number;
  className?: string;
}

function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`;
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );
}

/** ‹ / › markers for chips of events that continue before/after this day. */
function eventChipPrefix(event: T_CalendarEvent, dateBs: string): string {
  const start = parseBs(event.startBs);
  const end = parseBs(event.endBs);
  const day = parseBs(dateBs);
  if (!start || !end || !day) return "";
  if (compareBs(end, start) <= 0) return "";
  const continuesBefore = compareBs(start, day) < 0;
  const continuesAfter = compareBs(day, end) < 0;
  return `${continuesBefore ? "‹ " : ""}${continuesAfter ? " ›" : ""}`;
}

function truncateTitle(title: string, max = 22): string {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

export function BsEventCalendar({
  events,
  year,
  month,
  onMonthChange,
  kindFilter,
  onEventClick,
  onDayClick,
  isLoading = false,
  renderEventActions,
  lang = "en",
  maxVisibleEvents = 3,
  className,
}: BsEventCalendarProps) {
  const isDesktop = useMinWidth(768);
  const [viewPref, setViewPref] = useState<CalendarView>("month");
  const view: CalendarView = isDesktop ? viewPref : "agenda";
  const [selected, setSelected] = useState<T_CalendarEvent | null>(null);
  const [hiddenKinds, setHiddenKinds] = useState<T_CalendarEventKind[]>([]);

  const today = useMemo(() => todayBs(), []);
  const holidayDateKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const event of events) {
      if (event.kind !== "HOLIDAY") continue;
      const start = parseBs(event.startBs);
      if (!start) continue;
      const end = parseBs(event.endBs ?? event.startBs) ?? start;
      let cursor = start;
      // Walk day by day, bounded by the table range to stay safe.
      for (let i = 0; i < 40 * 12 && compareBs(cursor, end) <= 0; i++) {
        keys.add(formatBs(cursor));
        const daysInMonth = getDaysInBsMonth(cursor.year, cursor.month);
        if (cursor.day < daysInMonth) {
          cursor = { ...cursor, day: cursor.day + 1 };
        } else if (cursor.month < 12) {
          cursor = { year: cursor.year, month: cursor.month + 1, day: 1 };
        } else if (cursor.year < BS_MAX_YEAR) {
          cursor = { year: cursor.year + 1, month: 1, day: 1 };
        } else {
          break;
        }
      }
    }
    return keys;
  }, [events]);

  // ── Base kinds for the filter popover ──────────────────────────────────────
  const baseKinds = useMemo(() => {
    if (kindFilter && kindFilter.length > 0) return kindFilter;
    return [...new Set(events.map((event) => event.kind))];
  }, [events, kindFilter]);

  const visibleKinds = useMemo(
    () => baseKinds.filter((kind) => !hiddenKinds.includes(kind)),
    [baseKinds, hiddenKinds],
  );

  // ── Filtered events ────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => events.filter((event) => visibleKinds.includes(event.kind)),
    [events, visibleKinds],
  );

  // ── Day model (BS only — no JS Date), including neighbor-month padding ─────
  const days = useMemo<DayModel[]>(() => {
    const startWeekday = getBsMonthStartWeekday(year, month); // 0 = Sunday

    const build = (
      y: number,
      m: number,
      from: number,
      to: number,
      outside: boolean,
      firstWeekday: number,
    ): DayModel[] => {
      const result: DayModel[] = [];
      for (let day = Math.max(1, from); day <= to; day++) {
        const date = { year: y, month: m, day };
        const dateBs = formatBs(date);
        const dayEvents = filtered.filter((event) => {
          const start = parseBs(event.startBs);
          if (!start) return false;
          const end = parseBs(event.endBs ?? event.startBs) ?? start;
          return compareBs(start, date) <= 0 && compareBs(date, end) <= 0;
        });
        result.push({
          dateBs,
          day,
          weekday: 0,
          isToday: compareBs(today, date) === 0,
          isOutside: outside,
          isHoliday: holidayDateKeys.has(dateBs),
          events: dayEvents,
        });
      }
      // Fix weekday once day values are known (padding may start mid-week).
      result.forEach((dayModel, index) => {
        dayModel.weekday = (firstWeekday + index) % 7;
      });
      return result;
    };

    const result: DayModel[] = [];

    // Padding from the previous month (may reach across the year boundary).
    if (startWeekday > 0) {
      const prev = shiftBsMonth(year, month, -1);
      const prevDays = getDaysInBsMonth(prev.year, prev.month);
      const padFrom = prevDays - startWeekday + 1;
      result.push(
        ...build(
          prev.year,
          prev.month,
          padFrom,
          prevDays,
          true,
          (startWeekday - (prevDays - padFrom + 1) + 7) % 7,
        ),
      );
    }

    // The visible BS month itself.
    const count = getDaysInBsMonth(year, month);
    for (let day = 1; day <= count; day++) {
      const date = { year, month, day };
      const dateBs = formatBs(date);
      const dayEvents = filtered.filter((event) => {
        const start = parseBs(event.startBs);
        if (!start) return false;
        const end = parseBs(event.endBs ?? event.startBs) ?? start;
        return compareBs(start, date) <= 0 && compareBs(date, end) <= 0;
      });
      result.push({
        dateBs,
        day,
        weekday: (startWeekday + day - 1) % 7,
        isToday: compareBs(today, date) === 0,
        isOutside: false,
        isHoliday: holidayDateKeys.has(dateBs),
        events: dayEvents,
      });
    }

    // Trailing padding from the next month (may reach across the year boundary).
    const remainder = (startWeekday + count) % 7;
    if (remainder > 0) {
      const next = shiftBsMonth(year, month, 1);
      result.push(
        ...build(next.year, next.month, 1, 7 - remainder, true, (startWeekday + count) % 7),
      );
    }

    return result;
  }, [filtered, holidayDateKeys, month, today, year]);

  const dayIndex = useMemo(() => {
    const map = new Map<string, number>();
    days.forEach((day, index) => map.set(day.dateBs, index));
    return map;
  }, [days]);

  const weeks = useMemo<(DayModel | null)[][]>(() => {
    const rows: (DayModel | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows.slice(0, 6);
  }, [days]);

  // ── Keyboard day navigation (roving tabindex over day-number buttons) ─────
  const dayRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const defaultFocusDay = days.find((day) => day.isToday)?.dateBs ?? days[0]?.dateBs ?? "";
  const [focusedDayBs, setFocusedDayBs] = useState(defaultFocusDay);
  const activeFocusDay = days.some((day) => day.dateBs === focusedDayBs)
    ? focusedDayBs
    : defaultFocusDay;

  const handleDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, dateBs: string) => {
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const delta = deltas[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const index = days.findIndex((day) => day.dateBs === dateBs);
    if (index < 0) return;
    const nextIndex = Math.min(Math.max(index + delta, 0), days.length - 1);
    dayRefs.current[nextIndex]?.focus();
  };

  // ── Toolbar navigation ─────────────────────────────────────────────────────
  const goPrev = () => {
    const { year: y, month: m } = shiftBsMonth(year, month, -1);
    if (y < BS_MIN_YEAR) return;
    onMonthChange(y, m);
  };
  const goNext = () => {
    const { year: y, month: m } = shiftBsMonth(year, month, 1);
    if (y > BS_MAX_YEAR) return;
    onMonthChange(y, m);
  };
  const goToday = () => onMonthChange(today.year, today.month);
  const canPrev = year > BS_MIN_YEAR || month > 1;
  const canNext = year < BS_MAX_YEAR || month < 12;

  const yearOptions = useMemo(
    () =>
      Array.from({ length: BS_MAX_YEAR - BS_MIN_YEAR + 1 }, (_, i) => ({
        value: String(BS_MIN_YEAR + i),
        label: localizeDigits(BS_MIN_YEAR + i, lang),
      })),
    [lang],
  );
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: getBsMonthName(i + 1, lang),
      })),
    [lang],
  );

  const weekdays = lang === "ne" ? BS_WEEKDAYS_NE : BS_WEEKDAYS_EN;
  const label = `${getBsMonthName(month, lang)} ${localizeDigits(year, lang)}`;

  const openEvent = (event: T_CalendarEvent) => {
    if (onEventClick) {
      onEventClick(event);
      return;
    }
    setSelected(event);
  };

  // ── Agenda model: events grouped by start day ─────────────────────────────
  const agenda = useMemo(() => {
    const byDay = new Map<string, T_CalendarEvent[]>();
    for (const event of filtered) {
      if (!parseBs(event.startBs)) continue;
      const bucket = byDay.get(event.startBs) ?? [];
      bucket.push(event);
      byDay.set(event.startBs, bucket);
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateBs, dayEvents]) => ({
        dateBs,
        events: [...dayEvents].sort((a, b) =>
          (a.startTime ?? "").localeCompare(b.startTime ?? ""),
        ),
      }));
  }, [filtered]);

  return (
    <div className={cn("w-full min-w-0 select-none", className)}>
      {/* ── Toolbar ── */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1">
          <span aria-live="polite" className="sr-only">
            {label}
          </span>
          <span className="block truncate text-base font-semibold text-foreground" aria-hidden>
            {label}
          </span>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button
              variant="ghost"
              mode="icon"
              size="sm"
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Previous month"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              mode="icon"
              size="sm"
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next month"
            >
              <ChevronRight />
            </Button>
          </div>

          <SelectCommand
            className="w-32"
            value={String(year)}
            onChange={(value) => onMonthChange(Number(value), month)}
            options={yearOptions}
            searchPlaceholder="Search year..."
          />
          <SelectCommand
            className="w-32"
            hideSearch
            value={String(month)}
            onChange={(value) => onMonthChange(year, Number(value))}
            options={monthOptions}
          />

          {baseKinds.length > 1 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal />
                  Calendars
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-2">
                <p className="px-1 pb-1 text-xs font-medium text-muted-foreground">
                  Calendars
                </p>
                <div className="space-y-1">
                  {baseKinds.map((kind) => (
                    <label
                      key={kind}
                      className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-accent"
                    >
                      <Checkbox
                        checked={!hiddenKinds.includes(kind)}
                        onCheckedChange={(checked) =>
                          setHiddenKinds((prev) =>
                            checked
                              ? prev.filter((k) => k !== kind)
                              : [...prev, kind],
                          )
                        }
                        aria-label={`Show ${CALENDAR_KIND_META[kind].label}`}
                      />
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          CALENDAR_KIND_META[kind].dot,
                        )}
                      />
                      {CALENDAR_KIND_META[kind].label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {isDesktop && (
            <Tabs
              value={view}
              onValueChange={(value) => setViewPref(value as CalendarView)}
            >
              <TabsList>
                <TabsTrigger value="month">
                  <CalendarDays />
                  Month
                </TabsTrigger>
                <TabsTrigger value="agenda">
                  <List />
                  Agenda
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      {isLoading ? (
        <div className="space-y-2 rounded-xl border border-border p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      ) : view === "month" ? (
        <MonthGrid
          weeks={weeks}
          weekdays={weekdays}
          lang={lang}
          activeFocusDay={activeFocusDay}
          dayRefs={dayRefs}
          dayIndex={dayIndex}
          onDayKeyDown={handleDayKeyDown}
          onFocusDay={setFocusedDayBs}
          onDayClick={onDayClick}
          openEvent={openEvent}
          maxVisibleEvents={maxVisibleEvents}
        />
      ) : (
        <AgendaView agenda={agenda} lang={lang} openEvent={openEvent} />
      )}

      {/* ── Event dialog ── */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {CALENDAR_KIND_META[selected.kind].label}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      CALENDAR_KIND_META[selected.kind].dot,
                    )}
                  />
                  <Badge variant="outline">
                    {CALENDAR_KIND_META[selected.kind].label}
                  </Badge>
                  {selected.status && (
                    <Badge variant="secondary">{selected.status}</Badge>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-muted-foreground">Date</span>
                    <span>{eventDateLabel(selected, lang)}</span>
                  </div>
                  {(selected.startTime || selected.endTime) && (
                    <div className="flex gap-2">
                      <span className="w-20 shrink-0 text-muted-foreground">Time</span>
                      <span>
                        {[selected.startTime, selected.endTime]
                          .filter(Boolean)
                          .join(" – ") || "—"}
                      </span>
                    </div>
                  )}
                  {Object.entries(selected.meta ?? {}).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <span className="w-20 shrink-0 text-muted-foreground">{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                {renderEventActions?.(selected, () => setSelected(null))}
                {selected.href && (
                  <Button asChild variant="outline">
                    <a
                      href={selected.href}
                      {...(selected.href.startsWith("/")
                        ? {}
                        : { target: "_blank", rel: "noreferrer" })}
                    >
                      <ExternalLink />
                      Open
                    </a>
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function eventDateLabel(event: T_CalendarEvent, lang: BsLang): string {
  const start = parseBs(event.startBs);
  if (!start) return event.startBs;
  const end = parseBs(event.endBs);
  if (end && compareBs(end, start) > 0) {
    return `${formatBsLong(start, lang)} → ${formatBsLong(end, lang)}`;
  }
  return formatBsLong(start, lang);
}

// ── Month grid (Paragon layout: 1px gap over the border token) ───────────────

interface MonthGridProps {
  weeks: (DayModel | null)[][];
  weekdays: readonly string[];
  lang: BsLang;
  activeFocusDay: string;
  dayRefs: RefObject<Array<HTMLButtonElement | null>>;
  dayIndex: Map<string, number>;
  onDayKeyDown: (event: KeyboardEvent<HTMLButtonElement>, dateBs: string) => void;
  onFocusDay: (dateBs: string) => void;
  onDayClick?: (dateBs: string) => void;
  openEvent: (event: T_CalendarEvent) => void;
  maxVisibleEvents: number;
}

function MonthGrid({
  weeks,
  weekdays,
  lang,
  activeFocusDay,
  dayRefs,
  dayIndex,
  onDayKeyDown,
  onFocusDay,
  onDayClick,
  openEvent,
  maxVisibleEvents,
}: MonthGridProps) {
  return (
    <div
      role="grid"
      aria-label="Event calendar"
      className="overflow-hidden rounded-xl border border-border"
    >
      <div className="grid grid-cols-7 gap-px border-b border-border bg-border">
        {weekdays.map((day, index) => (
          <div
            key={`${day}-${index}`}
            role="columnheader"
            className={cn(
              "bg-card px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground",
              index === 6 && "text-destructive/80",
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border">
        {weeks.map((week, weekIndex) =>
          week.map((cell, colIndex) => {
            if (!cell) {
              return (
                <div
                  key={`blank-${weekIndex}-${colIndex}`}
                  role="gridcell"
                  className="min-h-24 bg-card/60 sm:min-h-28"
                />
              );
            }
            const visibleChips = cell.events.slice(0, maxVisibleEvents);
            const overflowCount = cell.events.length - visibleChips.length;
            const flatIndex = dayIndex.get(cell.dateBs) ?? -1;
            return (
              <DayCell
                key={cell.dateBs}
                cell={cell}
                visibleChips={visibleChips}
                overflowCount={overflowCount}
                lang={lang}
                focusable={cell.dateBs === activeFocusDay}
                registerRef={(el) => {
                  dayRefs.current[flatIndex] = el;
                }}
                onDayKeyDown={onDayKeyDown}
                onFocusDay={onFocusDay}
                onDayClick={onDayClick}
                openEvent={openEvent}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

interface DayCellProps {
  cell: DayModel;
  visibleChips: T_CalendarEvent[];
  overflowCount: number;
  lang: BsLang;
  focusable: boolean;
  registerRef: (el: HTMLButtonElement | null) => void;
  onDayKeyDown: (event: KeyboardEvent<HTMLButtonElement>, dateBs: string) => void;
  onFocusDay: (dateBs: string) => void;
  onDayClick?: (dateBs: string) => void;
  openEvent: (event: T_CalendarEvent) => void;
}

function DayCell({
  cell,
  visibleChips,
  overflowCount,
  lang,
  focusable,
  registerRef,
  onDayKeyDown,
  onFocusDay,
  onDayClick,
  openEvent,
}: DayCellProps) {
  const parsed = parseBs(cell.dateBs);
  const ariaLabel = parsed
    ? `${formatBsLong(parsed, lang)}${cell.events.length > 0 ? `, ${cell.events.length} event${cell.events.length > 1 ? "s" : ""}` : ""}`
    : cell.dateBs;

  return (
    <div
      role="gridcell"
      className={cn(
        "group/day relative flex min-h-24 flex-col gap-1 bg-card p-1.5 transition-colors duration-150 ease-out sm:min-h-28",
        "hover:bg-accent/40",
        cell.isOutside && "bg-card/60",
        // Saturday is the weekly off in Nepal (WORKING_DAYS_MODE=WORKING).
        cell.weekday === 6 && "bg-muted/40",
        cell.isHoliday && "bg-red-500/[0.04]",
        cell.isOutside && "opacity-80",
      )}
    >
      {/* Whole-cell click target for pages that can create */}
      {onDayClick && (
        <button
          type="button"
          onClick={() => onDayClick(cell.dateBs)}
          aria-label={`Add event on ${ariaLabel}`}
          className="absolute inset-0 z-0 cursor-pointer"
        />
      )}

      {/* Day number: keyboard navigation lives here (Paragon: right-aligned) */}
      <div className="relative z-10 flex justify-end">
        <button
          type="button"
          ref={registerRef}
          tabIndex={focusable ? 0 : -1}
          onKeyDown={(event) => onDayKeyDown(event, cell.dateBs)}
          onFocus={() => onFocusDay(cell.dateBs)}
          onClick={() => onDayClick?.(cell.dateBs)}
          aria-label={ariaLabel}
          aria-current={cell.isToday ? "date" : undefined}
          className={cn(
            "flex size-6 cursor-pointer items-center justify-center rounded-full text-xs tabular-nums outline-none",
            "transition-[background-color,color] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring",
            cell.isToday
              ? "bg-primary font-semibold text-primary-foreground"
              : cell.isOutside
                ? "text-muted-foreground/50 hover:bg-accent"
                : "text-foreground hover:bg-accent",
          )}
        >
          {localizeDigits(cell.day, lang)}
        </button>
      </div>

      {/* Chips */}
      <div className={cn("relative z-10 flex flex-col gap-0.5", cell.isOutside && "opacity-60")}>
        {visibleChips.map((event) => (
          <EventChip
            key={event.id}
            event={event}
            dateBs={cell.dateBs}
            onSelect={openEvent}
          />
        ))}
        {overflowCount > 0 && (
          <DayEventsPopover
            cell={cell}
            count={overflowCount}
            lang={lang}
            openEvent={openEvent}
          />
        )}
      </div>
    </div>
  );
}

function EventChip({
  event,
  dateBs,
  onSelect,
}: {
  event: T_CalendarEvent;
  dateBs: string;
  onSelect?: (event: T_CalendarEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(event)}
      aria-label={`${event.title}${event.startTime ? `, ${event.startTime}` : ""}`}
      title={event.title}
      className={cn(
        "flex h-5 w-full cursor-pointer items-center gap-1 rounded px-1.5 text-left text-[11px] font-medium leading-none outline-none",
        "transition-[opacity] duration-150 ease-out hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring",
        CALENDAR_KIND_META[event.kind].chip,
      )}
    >
      <span
        aria-hidden
        className={cn("size-1.5 shrink-0 rounded-full", CALENDAR_KIND_META[event.kind].dot)}
      />
      {event.startTime && (
        <span className="shrink-0 opacity-70 tabular-nums">{event.startTime}</span>
      )}
      <span className="min-w-0 flex-1 truncate">
        {eventChipPrefix(event, dateBs)}
        {truncateTitle(event.title)}
      </span>
    </button>
  );
}

function DayEventsPopover({
  cell,
  count,
  lang,
  openEvent,
}: {
  cell: DayModel;
  count: number;
  lang: BsLang;
  openEvent: (event: T_CalendarEvent) => void;
}) {
  const parsed = parseBs(cell.dateBs);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-5 w-full cursor-pointer items-center rounded px-1.5 text-left text-[11px] font-medium text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          +{count} more
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-64 p-2">
        <p className="px-1.5 pb-1.5 pt-0.5 text-xs font-medium text-muted-foreground">
          {parsed ? formatBsLong(parsed, lang) : cell.dateBs} · {cell.events.length}{" "}
          {cell.events.length === 1 ? "event" : "events"}
        </p>
        <div className="flex flex-col gap-1">
          {cell.events.map((event) => (
            <EventChip
              key={event.id}
              event={event}
              dateBs={cell.dateBs}
              onSelect={openEvent}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Agenda view ──────────────────────────────────────────────────────────────

function AgendaView({
  agenda,
  lang,
  openEvent,
}: {
  agenda: Array<{ dateBs: string; events: T_CalendarEvent[] }>;
  lang: BsLang;
  openEvent: (event: T_CalendarEvent) => void;
}) {
  if (agenda.length === 0) {
    return (
      <div className="grid min-h-40 place-items-center rounded-xl border border-border text-sm text-muted-foreground">
        No events this month.
      </div>
    );
  }
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {agenda.map(({ dateBs, events }) => {
        const parsed = parseBs(dateBs);
        if (!parsed) return null;
        const isToday = compareBs(todayBs(), parsed) === 0;
        return (
          <div key={dateBs} className="flex gap-3 p-3">
            <div className="w-24 shrink-0">
              <p
                className={cn(
                  "text-sm font-medium text-foreground",
                  isToday && "text-primary",
                )}
              >
                {formatBsLong(parsed, lang)}
              </p>
              {isToday && <p className="text-xs text-primary">Today</p>}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              {events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => openEvent(event)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border/70 px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      CALENDAR_KIND_META[event.kind].dot,
                    )}
                  />
                  <span className="min-w-0 truncate">{event.title}</span>
                  <Badge variant="outline" className="ms-auto shrink-0">
                    {CALENDAR_KIND_META[event.kind].label}
                  </Badge>
                  {(event.startTime || event.endTime) && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {[event.startTime, event.endTime].filter(Boolean).join("–")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BsEventCalendar;
