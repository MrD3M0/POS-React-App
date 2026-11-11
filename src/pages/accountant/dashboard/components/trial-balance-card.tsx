import { Scale } from "lucide-react";
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
  WidgetError,
  WidgetSkeleton,
} from "@/components/common/widget-state";

/** Trial balance: every debit against every credit. */
export default function TrialBalanceCard({
  debit,
  credit,
  balanced,
  isLoading,
  isError,
  onRetry,
}: {
  debit: number;
  credit: number;
  balanced: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="size-4" />
          Trial Balance
        </CardTitle>
        <CardDescription>
          Total debit against total credit of the whole college.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={3} />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total debit</span>
              <span className="font-medium">{formatNpr(debit)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total credit</span>
              <span className="font-medium">{formatNpr(credit)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <Badge variant={balanced ? "default" : "destructive"}>
                {balanced ? "Balanced" : "Not balanced"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Difference {formatNpr(Math.abs(debit - credit))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
