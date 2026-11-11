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
import type { T_DashboardRecentResult } from "@/types/teacher-dashboard";
import { formatMarks, formatPercent } from "../dashboard-utils";
import { WidgetEmpty, WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

export default function RecentResultsTable({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_DashboardRecentResult[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const published = data.filter((row) => row.published).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Results</CardTitle>
        <CardDescription>
          Latest published and pending results of your subjects
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
              title="No results yet"
              description="Results appear here once marks are entered."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Average</TableHead>
                <TableHead className="text-right">Highest</TableHead>
                <TableHead className="text-right">Lowest</TableHead>
                <TableHead className="text-right">Pass %</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={`${row.resultId ?? "row"}-${row.subjectName}-${index}`}
                >
                  <TableCell>{row.examName}</TableCell>
                  <TableCell>{row.subjectName}</TableCell>
                  <TableCell className="text-right">
                    {formatMarks(row.average)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMarks(row.highest)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMarks(row.lowest)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(row.passPercent)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={row.published ? "success" : "outline"}>
                      {row.published ? "Published" : row.status}
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
          ? "No results have been generated yet."
          : `${data.length} result row${data.length === 1 ? "" : "s"} · ${published} published.`}
      </CardFooter>
    </Card>
  );
}
