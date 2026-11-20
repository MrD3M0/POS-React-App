import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { useCalendarEvents } from "@/components/calendar/use-calendar-events";
import { CALENDAR_KIND_META } from "@/components/calendar/calendar-types";
import {
  formatBs,
  getBsMonthName,
  getBsMonthStartWeekday,
  getDaysInBsMonth,
  todayBs,
} from "@/lib/bs-date";
import { shiftBsMonth } from "@/components/calendar/calendar-types";
import { cn } from "@/lib/utils";

const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Compact BS month calendar for the teacher dashboard. Marks days that have a
 * class (or holiday) and lists the selected day's items underneath.
 */
export default function MiniCalendar() {
  const today = todayBs();
  const todayString = formatBs(today);

  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [selectedDay, setSelectedDay] = useState<string | null>(todayString);

  const calendar = useCalendarEvents({
    year,
    month,
    kinds: ["HOLIDAY", "CLASS"],
  });

  const days = useMemo(() => {
    const total = getDaysInBsMonth(year, month);
    const startWeekday = getBsMonthStartWeekday(year, month);
    const cells: Array<{ dateBs: string; day: number } | null> = Array.from(
      { length: startWeekday },
      () => null,
    );
    for (let day = 1; day <= total; day += 1) {
      cells.push({ dateBs: formatBs({ year, month, day }), day });
    }
    return cells;
  }, [month, year]);

  const eventDates = useMemo(() => {
    const map = new Map<string, number>();
    for (const event of calendar.events) {
      map.set(event.startBs, (map.get(event.startBs) ?? 0) + 1);
    }
    return map;
  }, [calendar.events]);

  const selectedEvents = useMemo(
    () => calendar.events.filter((event) => event.startBs === selectedDay),
    [calendar.events, selectedDay],
  );

  const moveMonth = (delta: number) => {
    const next = shiftBsMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
    setSelectedDay(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              {getBsMonthName(month, "en")} {year}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              mode="icon"
              onClick={() => moveMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              mode="icon"
              onClick={() => moveMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
          {WEEKDAY_INITIALS.map((label, index) => (
            <span key={`${label}-${index}`} className={index === 6 ? "text-destructive/70" : ""}>
              {label}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((cell, index) =>
            cell === null ? (
              <span key={`blank-${index}`} />
            ) : (
              <button
                key={cell.dateBs}
                type="button"
                onClick={() => setSelectedDay(cell.dateBs)}
                aria-label={`${cell.dateBs}${eventDates.get(cell.dateBs) ? `, ${eventDates.get(cell.dateBs)} events` : ""}`}
                aria-current={cell.dateBs === todayString ? "date" : undefined}
                className={cn(
                  "relative flex h-7 items-center justify-center rounded text-xs tabular-nums outline-none transition-colors",
                  "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  cell.dateBs === todayString && "bg-primary font-semibold text-primary-foreground",
                  cell.dateBs !== todayString &&
                    selectedDay === cell.dateBs &&
                    "ring-1 ring-primary",
                )}
              >
                {cell.day}
                {eventDates.get(cell.dateBs) ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-0.5 size-1 rounded-full",
                      cell.dateBs === todayString ? "bg-primary-foreground" : "bg-primary",
                    )}
                  />
                ) : null}
              </button>
            ),
          )}
        </div>

        {selectedDay && selectedEvents.length > 0 ? (
          <div className="space-y-1.5 border-t pt-2">
            {selectedEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    aria-hidden
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      CALENDAR_KIND_META[event.kind].dot,
                    )}
                  />
                  <span className="truncate">{event.title}</span>
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {event.startTime ?? CALENDAR_KIND_META[event.kind].label}
                </span>
              </div>
            ))}
            {selectedEvents.length > 3 ? (
              <Badge variant="outline" className="w-fit">
                +{selectedEvents.length - 3} more
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {calendar.isLoading
          ? "Loading calendar..."
          : calendar.isError
            ? "Calendar could not be loaded."
            : `${calendar.events.length} item${calendar.events.length === 1 ? "" : "s"} this month.`}
      </CardFooter>
    </Card>
  );
}
