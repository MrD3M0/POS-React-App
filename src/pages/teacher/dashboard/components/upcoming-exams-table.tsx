import { Link } from "react-router-dom";
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
import type {
  T_DashboardExamBatch,
  T_DashboardMarksStatus,
} from "@/types/teacher-dashboard";
import { formatMarks, shortBsDate } from "../dashboard-utils";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

function marksVariant(status: T_DashboardMarksStatus) {
  if (status === "COMPLETE") return "success" as const;
  if (status === "PARTIAL") return "warning" as const;
  return "outline" as const;
}

export default function UpcomingExamsTable({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_DashboardExamBatch[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const pending = data.filter((row) => row.marksStatus !== "COMPLETE").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Exam Batches</CardTitle>
        <CardDescription>
          Exams of your subjects and their marks-entry status
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
              title="No upcoming exam batches"
              description="Exams created for your subjects will show up here."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class / Section</TableHead>
                <TableHead className="text-right">Full</TableHead>
                <TableHead className="text-right">Pass</TableHead>
                <TableHead className="text-right">Marks Entry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">
                    {shortBsDate(row.examDateBs)}
                  </TableCell>
                  <TableCell>{row.examName}</TableCell>
                  <TableCell>{row.subjectName}</TableCell>
                  <TableCell>{row.classLabel || "—"}</TableCell>
                  <TableCell className="text-right">
                    {formatMarks(row.fullMarks)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMarks(row.passMarks)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant={marksVariant(row.marksStatus)}>
                        {row.marksStatus}
                      </Badge>
                      {row.marksStatus !== "COMPLETE" ? (
                        <Link
                          to="/teacher/marks"
                          className="text-xs text-primary underline-offset-4 hover:underline"
                        >
                          Enter
                        </Link>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {data.length === 0
          ? "No exam batches scheduled yet."
          : `${data.length} exam batch${data.length === 1 ? "" : "es"} · ${pending} still need marks.`}
      </CardFooter>
    </Card>
  );
}
