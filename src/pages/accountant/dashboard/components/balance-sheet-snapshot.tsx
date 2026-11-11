import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNpr } from "@/lib/money";
import {
  WidgetError,
  WidgetSkeleton,
} from "@/components/common/widget-state";

/** Balance sheet snapshot of the current fiscal year. */
export default function BalanceSheetSnapshot({
  assets,
  liabilities,
  equity,
  isLoading,
  isError,
  onRetry,
}: {
  assets: number;
  liabilities: number;
  equity: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const rows = [
    { label: "Assets", value: assets },
    { label: "Liabilities", value: liabilities },
    { label: "Equity", value: equity },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Sheet Snapshot</CardTitle>
        <CardDescription>
          Assets, liabilities and equity of the fiscal year in progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={3} />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : (
          <dl className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between text-sm"
              >
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-medium">{formatNpr(row.value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
