import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import type { T_RecentPayment } from "../service/service";

/** The last receipts, with the method they were paid with. */
export default function RecentPaymentsTable({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_RecentPayment[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>The last receipts recorded in the college.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={5} />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : data.length === 0 ? (
          <WidgetEmpty
            title="No payment yet"
            description="Receipts appear here as soon as a fee is collected."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Receipt No.</TableHead>
                <TableHead scope="col">Student</TableHead>
                <TableHead scope="col">Batch</TableHead>
                <TableHead scope="col">Method</TableHead>
                <TableHead scope="col" className="text-right">Amount</TableHead>
                <TableHead scope="col">Date (BS)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/accountant/billing/receipt/${payment.id}`}
                      className="text-primary underline"
                    >
                      {payment.receiptNo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="block truncate">
                      {payment.student || "—"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {payment.universityRegNo}
                    </span>
                  </TableCell>
                  <TableCell>{payment.batch}</TableCell>
                  <TableCell>
                    <Badge variant={payment.isSplit ? "secondary" : "outline"}>
                      {payment.methods || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNpr(payment.totalAmount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {payment.paymentDateBs}
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
