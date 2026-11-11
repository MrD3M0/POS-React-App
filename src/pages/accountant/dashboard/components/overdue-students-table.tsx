import { Link } from "react-router-dom";
import { HandCoins } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNpr } from "@/lib/money";
import {
  WidgetEmpty,
  WidgetError,
  WidgetSkeleton,
} from "@/components/common/widget-state";
import type { T_OverdueStudent } from "../service/service";

/** Students whose fee is past its due date. */
export default function OverdueStudentsTable({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_OverdueStudent[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overdue Students</CardTitle>
        <CardDescription>
          Fees that passed their due date and are still not paid.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : data.length === 0 ? (
          <WidgetEmpty
            title="No overdue fee"
            description="Every due date of the college is still ahead."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Student</TableHead>
                <TableHead scope="col">Batch</TableHead>
                <TableHead scope="col">Oldest Due (BS)</TableHead>
                <TableHead scope="col">Overdue</TableHead>
                <TableHead scope="col" className="text-right">Due Amount</TableHead>
                <TableHead scope="col" className="text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell>
                    <span className="block truncate font-medium">
                      {student.name || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {student.universityRegNo}
                    </span>
                  </TableCell>
                  <TableCell>{student.batch}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {student.oldestDueBs}
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      {student.daysOverdue} day
                      {student.daysOverdue === 1 ? "" : "s"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNpr(student.dueAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/accountant/billing/record">
                        <HandCoins className="size-3.5" />
                        Collect fee
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
