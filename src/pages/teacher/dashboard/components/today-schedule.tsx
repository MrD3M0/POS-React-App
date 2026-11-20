import { Link } from "react-router-dom";
import { ArrowRight, CalendarOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge";
import StatusBadge from "@/components/ui/status-badge";
import Button from "@/components/ui/button";
import type {
  T_DashboardScheduleItem,
  T_DashboardScheduleStatus,
  T_DashboardTodaySchedule,
} from "@/types/teacher-dashboard";
import { periodTimeLabel } from "../dashboard-utils";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

const STATUS_LABEL: Record<T_DashboardScheduleStatus, string> = {
  COMPLETED: "Completed",
  ONGOING: "Ongoing",
  UPCOMING: "Upcoming",
};

const STATUS_VARIANT: Record<
  T_DashboardScheduleStatus,
  "secondary" | "warning" | "outline"
> = {
  COMPLETED: "secondary",
  ONGOING: "warning",
  UPCOMING: "outline",
};

/** Take-attendance link pre-filled with this schedule row. */
function takeAttendanceHref(item: T_DashboardScheduleItem, dateBs: string | null) {
  const params = new URLSearchParams();
  params.set("assignmentId", item.assignmentId);
  if (item.periodId) params.set("periodId", item.periodId);
  if (dateBs) params.set("dateBs", dateBs);
  return `/teacher/take-attendance?${params.toString()}`;
}

export default function TodaySchedule({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_DashboardTodaySchedule | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const items = data?.todaySchedule ?? [];
  const pending = data?.pendingAttendance ?? 0;
  const holiday = data?.holiday ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Schedule</CardTitle>
        <CardDescription>
          {holiday
            ? `Holiday — ${holiday.name}`
            : `Classes scheduled for today (${pending} attendance pending)`}
        </CardDescription>
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
        ) : holiday ? (
          <div className="px-6">
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center">
              <CalendarOff className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">{holiday.name}</p>
              <p className="text-xs text-muted-foreground">
                Today is a holiday, so no classes are scheduled.
              </p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="px-6">
            <WidgetEmpty
              title="No classes scheduled today"
              description="Add these periods to the weekly routine to see them here."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class / Section</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.scheduleId ?? `${item.assignmentId}-${item.periodId ?? item.periodName}`}
                  className={
                    item.isNext
                      ? "bg-primary/5 font-medium"
                      : item.status === "COMPLETED"
                        ? "text-muted-foreground"
                        : undefined
                  }
                >
                  <TableCell className="whitespace-nowrap">
                    {periodTimeLabel(item.startTime, item.endTime)}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.periodName}
                    </span>
                    <Badge variant={STATUS_VARIANT[item.status]} className="ml-2">
                      {item.isNext ? "Next" : STATUS_LABEL[item.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.subjectName}</TableCell>
                  <TableCell>{item.classLabel || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.room ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.attendanceTaken ? (
                      <StatusBadge status="TAKEN" />
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={takeAttendanceHref(item, data?.dateBs ?? null)}>
                          Take Attendance
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {holiday
          ? "No classes on holidays."
          : items.length === 0
            ? "No periods in the weekly routine for today."
            : `${items.length} period${items.length === 1 ? "" : "s"} today · ${pending} still pending.`}
      </CardFooter>
    </Card>
  );
}
