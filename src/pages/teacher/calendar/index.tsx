import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BsEventCalendar from "@/components/calendar/bs-event-calendar";
import { useCalendarEvents } from "@/components/calendar/use-calendar-events";
import {
  CALENDAR_KIND_META,
  type T_CalendarEvent,
} from "@/components/calendar/calendar-types";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  adToBs,
  bsToAd,
  formatBs,
  formatBsLong,
  parseBs,
  todayBs,
} from "@/lib/bs-date";
import {
  bsWeekdayOf,
  enumerateBsDateRange,
} from "@/lib/bs-date-range";
import WeekView, { type T_WeekDay } from "./components/week-view";
import { getClassScheduleCalendar } from "./service/service";

type TCalendarView = "month" | "week";

/** Sunday of the week that contains `dateBs`. */
function sundayOfWeek(dateBs: string): string {
  const parsed = parseBs(dateBs);
  if (!parsed) return dateBs;
  const ad = bsToAd(parsed);
  const sunday = new Date(ad.getFullYear(), ad.getMonth(), ad.getDate() - ad.getDay());
  return formatBs(adToBs(sunday));
}

/** Adds days to a BS date with AD date arithmetic. */
function addDays(dateBs: string, days: number): string {
  const parsed = parseBs(dateBs);
  if (!parsed) return dateBs;
  const ad = bsToAd(parsed);
  return formatBs(
    adToBs(new Date(ad.getFullYear(), ad.getMonth(), ad.getDate() + days)),
  );
}

function takeAttendanceHref(row: {
  dateBs: string;
  teachingAssignmentId: string;
  periodId: string;
}) {
  const params = new URLSearchParams({
    assignmentId: row.teachingAssignmentId,
    periodId: row.periodId,
    dateBs: row.dateBs,
  });
  return `/teacher/take-attendance?${params.toString()}`;
}

/**
 * Teacher calendar: month view (BsEventCalendar) and week view (Sun–Sat),
 * built from the class-schedule routine (`/class-schedule/calendar`) plus
 * holidays, exams and notices. Class chips link straight to take-attendance
 * with the assignment, period and date pre-filled.
 */
export default function TeacherCalendarPage() {
  const today = todayBs();
  const todayBsString = formatBs(today);

  const [view, setView] = useState<TCalendarView>("month");
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [weekStart, setWeekStart] = useState(() => sundayOfWeek(todayBsString));
  const [showSaturday, setShowSaturday] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<T_CalendarEvent | null>(null);

  const calendar = useCalendarEvents({ year, month });

  const weekEnd = addDays(weekStart, showSaturday ? 6 : 5);
  const weekQuery = useQuery({
    queryKey: [QUERY_KEYS.CALENDAR_EVENTS, "teacher-week", weekStart, weekEnd],
    queryFn: () => getClassScheduleCalendar({ fromBs: weekStart, toBs: weekEnd }),
    enabled: view === "week",
  });

  const weekDays = useMemo<T_WeekDay[]>(() => {
    const dates = enumerateBsDateRange(weekStart, weekEnd);
    const classEvents = weekQuery.data?.events ?? [];
    const holidays = weekQuery.data?.holidays ?? [];
    return dates.map((dateBs) => {
      const holiday = holidays.find((row) => row.dateBs === dateBs) ?? null;
      const events: T_CalendarEvent[] = classEvents
        .filter((row) => row.dateBs === dateBs)
        .map((row) => ({
          id: `class-${row.id}-${row.dateBs}-${row.periodId}`,
          title:
            [row.subjectName ?? row.subjectCode, row.classLabel]
              .filter(Boolean)
              .join(" — ") || "Class",
          startBs: row.dateBs,
          startTime: row.startTime,
          endTime: row.endTime,
          kind: "CLASS",
          href: takeAttendanceHref(row),
          meta: {
            ...(row.periodName ? { Period: row.periodName } : {}),
            ...(row.batchName ? { Batch: row.batchName } : {}),
            ...(row.room ? { Room: row.room } : {}),
          },
        }));
      return {
        dateBs,
        dayOfWeek: ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][
          bsWeekdayOf(dateBs)
        ] ?? "",
        holidayName: holiday?.name ?? null,
        events,
      };
    });
  }, [weekEnd, weekQuery.data, weekStart]);

  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const fromWeek = weekDays.find((day) => day.dateBs === selectedDay)?.events ?? [];
    const fromMonth = calendar.events.filter((event) => event.startBs === selectedDay);
    const seen = new Set<string>();
    return [...fromWeek, ...fromMonth].filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    });
  }, [calendar.events, selectedDay, weekDays]);

  const goWeek = (delta: number) => setWeekStart((previous) => addDays(previous, delta * 7));

  return (
    <div className="p-5">
      <PageHeader
        title="My Calendar"
        description="Your weekly routine, exams, holidays and notices in one place."
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher/dashboard" },
          { title: "Calendar", link: "/teacher/calendar" },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={(value) => setView(value as TCalendarView)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "week" ? (
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={showSaturday}
                onCheckedChange={(checked) => setShowSaturday(checked === true)}
                aria-label="Show Saturday"
              />
              Saturday
            </label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                mode="icon"
                onClick={() => goWeek(-1)}
                aria-label="Previous week"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekStart(sundayOfWeek(todayBsString))}
              >
                This week
              </Button>
              <Button
                variant="outline"
                size="sm"
                mode="icon"
                onClick={() => goWeek(1)}
                aria-label="Next week"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        {view === "month" ? (
          <BsEventCalendar
            events={calendar.events}
            year={year}
            month={month}
            onMonthChange={(nextYear, nextMonth) => {
              setYear(nextYear);
              setMonth(nextMonth);
            }}
            kindFilter={calendar.roleKinds}
            isLoading={calendar.isLoading}
            onDayClick={(dateBs) => setSelectedDay(dateBs)}
          />
        ) : weekQuery.isLoading ? (
          <WidgetSkeleton rows={6} />
        ) : weekQuery.isError ? (
          <WidgetError onRetry={() => void weekQuery.refetch()} />
        ) : (
          <>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium">
                {parseBs(weekStart) ? formatBsLong(parseBs(weekStart)!, "en") : weekStart}
                {" — "}
                {parseBs(weekEnd) ? formatBsLong(parseBs(weekEnd)!, "en") : weekEnd}
              </p>
              <p className="text-xs text-muted-foreground">
                {weekDays.reduce((total, day) => total + day.events.length, 0)} periods
                this week
              </p>
            </div>
            {weekDays.every((day) => day.events.length === 0 && !day.holidayName) ? (
              <WidgetEmpty
                title="No classes this week"
                description="Periods from the weekly routine will appear here."
              />
            ) : null}
            <WeekView
              days={weekDays}
              showSaturday={showSaturday}
              isToday={(dateBs) => dateBs === todayBsString}
              onEventClick={(event) => setSelectedEvent(event)}
            />
          </>
        )}
      </div>

      {/* Day panel — click a day in month view */}
      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && parseBs(selectedDay)
                ? formatBsLong(parseBs(selectedDay)!, "en")
                : selectedDay}
            </DialogTitle>
            <DialogDescription>
              {dayEvents.length === 0
                ? "Nothing scheduled on this day."
                : `${dayEvents.length} item${dayEvents.length === 1 ? "" : "s"} scheduled.`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {[CALENDAR_KIND_META[event.kind].label, event.startTime, event.meta?.Room]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {event.kind === "CLASS" && event.href ? (
                  <Button asChild size="sm" variant="outline">
                    <Link to={event.href} onClick={() => setSelectedDay(null)}>
                      Take Attendance
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedDay(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Week-view event dialog */}
      <Dialog
        open={selectedEvent !== null}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedEvent ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {CALENDAR_KIND_META[selectedEvent.kind].label}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <Badge variant="outline">
                  {selectedEvent.startTime && selectedEvent.endTime
                    ? `${selectedEvent.startTime} – ${selectedEvent.endTime}`
                    : "All day"}
                </Badge>
                {Object.entries(selectedEvent.meta ?? {}).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="w-20 shrink-0 text-muted-foreground">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <DialogFooter>
                {selectedEvent.href ? (
                  <Button asChild variant="outline">
                    <Link to={selectedEvent.href} onClick={() => setSelectedEvent(null)}>
                      <ExternalLink />
                      Take Attendance
                    </Link>
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
