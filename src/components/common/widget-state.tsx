import { Inbox, RefreshCw, TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Loading placeholder shared by every dashboard widget. */
export function WidgetSkeleton({
  className,
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  );
}

/** Error state with a retry button — never leave a widget silently empty. */
export function WidgetError({
  onRetry,
  title = "Could not load this section",
  message,
  className,
}: {
  onRetry: () => void;
  title?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center",
        className,
      )}
      role="alert"
    >
      <TriangleAlert className="size-5 text-destructive" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        {message ? (
          <p className="mt-1 text-xs text-muted-foreground">{message}</p>
        ) : null}
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-3.5" />
        Retry
      </Button>
    </div>
  );
}

/** Empty state ("No data yet"). */
export function WidgetEmpty({
  title = "No data yet",
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-4 py-8 text-center",
        className,
      )}
    >
      <Inbox className="size-4 text-muted-foreground/60" />
      <p className="text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
