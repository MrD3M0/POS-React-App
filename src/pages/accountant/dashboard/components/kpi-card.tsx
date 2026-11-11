import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  title: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  badge?: string;
  className?: string;
}

/**
 * One KPI of the accountant dashboard: a figure, a helper line and the icon of
 * the section it belongs to.
 */
export default function KpiCard({
  title,
  value,
  helper,
  icon: Icon,
  isLoading,
  isError,
  onRetry,
  badge,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-28" />
          ) : isError ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 text-xs font-medium text-destructive underline"
            >
              Could not load — retry
            </button>
          ) : (
            <p className="mt-0.5 truncate text-xl font-semibold">{value}</p>
          )}
          {!isLoading && !isError && helper ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {helper}
            </p>
          ) : null}
          {badge && !isLoading && !isError ? (
            <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
