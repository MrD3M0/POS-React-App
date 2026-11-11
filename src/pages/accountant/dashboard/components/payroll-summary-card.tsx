import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { formatNpr } from "@/lib/money";
import {
  WidgetError,
  WidgetSkeleton,
} from "@/components/common/widget-state";
import type { T_PayrollSummary } from "../service/service";

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  DRAFT: "Draft",
  PENDING: "Pending principal approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAID: "Paid",
};

/** Payroll of the current BS month. */
export default function PayrollSummaryCard({
  payroll,
  isLoading,
  isError,
  onRetry,
}: {
  payroll: T_PayrollSummary | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const status = payroll?.status ?? "NOT_STARTED";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4" />
          Payroll — {payroll?.monthBs ? `Month ${payroll.monthBs}` : "current month"}
        </CardTitle>
        <CardDescription>
          {payroll?.yearBs ? `BS ${payroll.yearBs}` : "No payroll for this month yet"}
        </CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <Link to="/accountant/payroll/wizard">Open payroll</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : (
          <div className="space-y-3">
            <Badge
              variant={
                status === "REJECTED"
                  ? "destructive"
                  : status === "PAID" || status === "APPROVED"
                    ? "default"
                    : "secondary"
              }
            >
              {STATUS_LABEL[status] ?? status}
            </Badge>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total gross</dt>
                <dd className="font-medium">{formatNpr(payroll?.gross)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Attendance deductions
                </dt>
                <dd className="font-medium">{formatNpr(payroll?.deduction)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Net payable</dt>
                <dd className="font-semibold">{formatNpr(payroll?.net)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2">
                <dt className="text-muted-foreground">Payslips generated</dt>
                <dd className="font-medium">
                  {payroll?.payslipsGenerated ?? 0}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
