import { Link } from "react-router-dom";
import { AlarmClock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNpr } from "@/lib/money";
import {
  WidgetEmpty,
  WidgetError,
  WidgetSkeleton,
} from "@/components/common/widget-state";

/** Installments whose due date has passed and that still have a balance. */
export default function OverdueInstallmentsCard({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: { count: number; total: number } | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const count = data?.count ?? 0;
  const total = data?.total ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlarmClock className="size-4" />
          Overdue Installments
        </CardTitle>
        <CardDescription>
          Past their due date with a remaining balance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={3} />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : count === 0 ? (
          <WidgetEmpty
            title="Nothing overdue"
            description="Every installment is either paid or not due yet."
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-2xl font-semibold tabular-nums">
                {formatNpr(total)}
              </p>
              <Badge variant="destructive">
                {count} installment{count === 1 ? "" : "s"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Follow up on the students in the overdue list, or send the
              reminder from the billing screens.
            </p>
            <Link
              to="/accountant/billing/installments"
              className="text-sm font-medium text-primary hover:underline"
            >
              Open installments →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
