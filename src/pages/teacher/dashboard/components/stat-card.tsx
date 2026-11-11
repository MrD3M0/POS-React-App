import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WidgetError, WidgetSkeleton } from "@/components/common/widget-state";

export type T_StatCardProps = {
  title: string;
  value: number | string;
  helper: string;
  icon: LucideIcon;
  /** Optional trend text, e.g. "+3.2% vs last month". */
  trend?: string;
  /** Trend direction — decides the icon and colour. */
  trendDirection?: "up" | "down" | "flat";
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export default function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  trend,
  trendDirection = "flat",
  isLoading,
  isError,
  onRetry,
}: T_StatCardProps) {
  return (
    <Card className="gap-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={2} className="h-12" />
        ) : isError ? (
          <WidgetError onRetry={onRetry ?? (() => {})} />
        ) : (
          <>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              {trend ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-medium",
                    trendDirection === "up" && "text-emerald-600",
                    trendDirection === "down" && "text-destructive",
                  )}
                >
                  {trendDirection === "up" ? (
                    <TrendingUp className="size-3" />
                  ) : null}
                  {trendDirection === "down" ? (
                    <TrendingDown className="size-3" />
                  ) : null}
                  {trend}
                </span>
              ) : null}
              <span>{helper}</span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
