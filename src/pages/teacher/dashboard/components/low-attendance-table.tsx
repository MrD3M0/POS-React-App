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
import type { T_DashboardLowAttendanceStudent } from "@/types/teacher-dashboard";
import { formatPercent } from "../dashboard-utils";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

function statusVariant(percent: number) {
  if (percent < 50) return "destructive" as const;
  if (percent < 65) return "warning" as const;
  return "outline" as const;
}

function statusLabel(percent: number) {
  if (percent < 50) return "Critical";
  if (percent < 65) return "Low";
  return "Warning";
}

export default function LowAttendanceTable({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_DashboardLowAttendanceStudent[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Attendance Students</CardTitle>
        <CardDescription>Students below 75% attendance</CardDescription>
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
              title="No low attendance students"
              description="Everyone is above the 75% threshold."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class / Section</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Attendance</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={`${row.studentId}-${row.subjectName}`}>
                  <TableCell>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.universityRegNo}
                    </div>
                  </TableCell>
                  <TableCell>{row.classLabel || "—"}</TableCell>
                  <TableCell>{row.subjectName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPercent(row.attendancePercent)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={statusVariant(row.attendancePercent)}>
                      {statusLabel(row.attendancePercent)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {data.length === 0
          ? "Keep it up — no student is below the threshold."
          : `${data.length} student${data.length === 1 ? "" : "s"} need attention.`}
      </CardFooter>
    </Card>
  );
}
