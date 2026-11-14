import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNpr } from "@/lib/money";
import {
  WidgetEmpty,
  WidgetError,
  WidgetSkeleton,
} from "@/components/common/widget-state";

/** How the money received this fiscal year was paid (cash, bank, wallet…). */
export default function PaymentMethodSplit({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: { code: string; name: string; total: number }[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const total = data.reduce((sum, row) => sum + row.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          How fees were paid during the current fiscal year.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : data.length === 0 ? (
          <WidgetEmpty
            title="No payments yet"
            description="Payment methods appear once a fee receipt is recorded."
          />
        ) : (
          <ul className="space-y-3">
            {data.map((row) => {
              const percent = total > 0 ? (row.total / total) * 100 : 0;
              return (
                <li key={row.code}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{row.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatNpr(row.total)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {percent.toFixed(1)}% of{" "}
                    {formatNpr(total)} collected
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
