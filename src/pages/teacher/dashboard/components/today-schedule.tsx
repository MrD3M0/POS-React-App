import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
import Button from "@/components/ui/button";
import type { T_DashboardScheduleItem } from "@/types/teacher-dashboard";
import { periodTimeLabel } from "../dashboard-utils";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

export default function TodaySchedule({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_DashboardScheduleItem[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const pending = data.filter((item) => !item.attendanceTaken).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Schedule</CardTitle>
        <CardDescription>
          Classes scheduled for today ({pending} attendance pending)
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
        ) : data.length === 0 ? (
          <div className="px-6">
            <WidgetEmpty
              title="No classes scheduled today"
              description="Sessions created for today will show up here."
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
              {data.map((item) => (
                <TableRow
                  key={
                    item.sessionId ?? `${item.assignmentId}-${item.periodName}`
                  }
                  className={
                    item.isNext ? "bg-primary/5 font-medium" : undefined
                  }
                >
                  <TableCell className="whitespace-nowrap">
                    {periodTimeLabel(item.startTime, item.endTime)}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.periodName}
                    </span>
                    {item.isNext ? (
                      <Badge variant="success" className="ml-2">
                        Next
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{item.subjectName}</TableCell>
                  <TableCell>{item.classLabel || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.room ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.attendanceTaken ? (
                      <Badge variant="outline">Taken</Badge>
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <Link to="/teacher/take-attendance">
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
        {data.length === 0
          ? "No sessions were created for today."
          : `${data.length} session${data.length === 1 ? "" : "s"} today · ${pending} still pending.`}
      </CardFooter>
    </Card>
  );
}
