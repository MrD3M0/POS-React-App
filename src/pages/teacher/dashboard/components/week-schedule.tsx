import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";
import type {
  T_DashboardWeekDay,
  T_DashboardWeekSchedule,
} from "@/types/teacher-dashboard";
import { cn } from "@/lib/utils";

const DAY_SHORT: Record<string, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

function takeAttendanceHref(day: T_DashboardWeekDay, assignmentId: string, periodId: string | null) {
  const params = new URLSearchParams({
    assignmentId,
    dateBs: day.date,
  });
  if (periodId) params.set("periodId", periodId);
  return `/teacher/take-attendance?${params.toString()}`;
}

/**
 * This week's routine (Sunday–Friday) as a compact grid: one column per day,
 * one chip per period. Holidays are shown instead of the periods.
 */
export default function WeekSchedule({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_DashboardWeekSchedule | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const days = data?.days ?? [];
  const totalPeriods = days.reduce((total, day) => total + day.items.length, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
        <CardDescription>Your routine from Sunday to Friday.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="px-6">
            <WidgetSkeleton rows={4} />
          </div>
        ) : isError ? (
          <div className="px-6">
            <WidgetError onRetry={onRetry} />
          </div>
        ) : days.length === 0 ? (
          <div className="px-6">
            <WidgetEmpty
              title="No routine for this week"
              description="Add periods to the weekly schedule to see them here."
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 px-4 sm:grid-cols-3 xl:grid-cols-6">
            {days.map((day) => (
              <div
                key={day.date}
                className={cn(
                  "flex min-h-28 flex-col gap-1 rounded-lg border p-2",
                  day.holidayName && "bg-destructive/5",
                )}
              >
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-xs font-medium">{DAY_SHORT[day.dayOfWeek] ?? day.dayOfWeek}</span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {day.date.slice(-2)}
                  </span>
                </div>

                {day.holidayName ? (
                  <Badge variant="destructive" className="w-fit text-[10px]">
                    {day.holidayName}
                  </Badge>
                ) : day.items.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">No classes</p>
                ) : (
                  <div className="flex flex-col gap-1">
                    {day.items.map((item) => (
                      <Link
                        key={item.scheduleId ?? `${day.date}-${item.assignmentId}-${item.periodId ?? item.periodName}`}
                        to={takeAttendanceHref(day, item.assignmentId, item.periodId)}
                        title={`${item.label} · ${item.periodName}`}
                        className={cn(
                          "rounded px-1.5 py-1 text-[11px] leading-tight",
                          item.status === "ONGOING"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : item.status === "COMPLETED"
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-foreground",
                        )}
                      >
                        <span className="block truncate font-medium">{item.subjectCode ?? item.subjectName}</span>
                        <span className="block truncate text-[10px] opacity-80">
                          {[item.startTime, item.periodName].filter(Boolean).join(" · ")}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {days.length === 0
          ? "No days in this week."
          : `${totalPeriods} period${totalPeriods === 1 ? "" : "s"} this week.`}
      </CardFooter>
    </Card>
  );
}
