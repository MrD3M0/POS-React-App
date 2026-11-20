import { parseBs } from "@/lib/bs-date";
import { cn } from "@/lib/utils";
import {
  CALENDAR_KIND_META,
  type T_CalendarEvent,
} from "@/components/calendar/calendar-types";
import Badge from "@/components/ui/badge";

export type T_WeekDay = {
  dateBs: string;
  dayOfWeek: string;
  holidayName: string | null;
  events: T_CalendarEvent[];
};

/**
 * Week strip (Sunday–Friday, Saturday optional): one column per day with the
 * period chips of that day. Used by the teacher calendar week view.
 */
export default function WeekView({
  days,
  showSaturday,
  isToday,
  onEventClick,
}: {
  days: T_WeekDay[];
  showSaturday: boolean;
  isToday: (dateBs: string) => boolean;
  onEventClick?: (event: T_CalendarEvent) => void;
}) {
  const visibleDays = showSaturday ? days : days.slice(0, 6);

  if (visibleDays.length === 0) {
    return (
      <div className="grid min-h-40 place-items-center rounded-xl border border-border text-sm text-muted-foreground">
        No days in this week.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-xl border border-border bg-border",
        showSaturday ? "grid-cols-7" : "grid-cols-6",
      )}
    >
      {visibleDays.map((day) => {
        const parsed = parseBs(day.dateBs);
        return (
          <div
            key={day.dateBs}
            className={cn(
              "flex min-h-40 flex-col gap-1.5 bg-card p-2",
              day.holidayName && "bg-red-500/[0.04]",
            )}
          >
            <div className="flex items-baseline justify-between gap-1">
              <span
                className={cn(
                  "text-xs font-medium text-foreground",
                  isToday(day.dateBs) && "text-primary",
                )}
              >
                {day.dayOfWeek.slice(0, 3)}
              </span>
              <span
                className={cn(
                  "text-xs tabular-nums text-muted-foreground",
                  isToday(day.dateBs) &&
                    "rounded-full bg-primary px-1.5 font-semibold text-primary-foreground",
                )}
              >
                {parsed?.day ?? ""}
              </span>
            </div>

            {day.holidayName ? (
              <Badge variant="destructive" className="w-fit">
                {day.holidayName}
              </Badge>
            ) : day.events.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">No classes</p>
            ) : (
              <div className="flex flex-col gap-1">
                {day.events.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onEventClick?.(event)}
                    title={`${event.title}${event.startTime ? ` · ${event.startTime}` : ""}`}
                    className={cn(
                      "flex flex-col gap-0.5 rounded px-1.5 py-1 text-left text-[11px] font-medium leading-tight outline-none",
                      "transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring",
                      CALENDAR_KIND_META[event.kind].chip,
                    )}
                  >
                    {event.startTime ? (
                      <span className="text-[10px] tabular-nums opacity-70">
                        {[event.startTime, event.endTime].filter(Boolean).join("–")}
                      </span>
                    ) : null}
                    <span className="line-clamp-2">{event.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

