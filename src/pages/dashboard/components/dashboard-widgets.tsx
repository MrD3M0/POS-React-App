import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Inbox,
  RefreshCw,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type TIcon = ComponentType<{ className?: string }>;

/** Number card used by every role dashboard. */
export function RoleKpi({
  title,
  value,
  helper,
  icon: Icon,
  isLoading,
  isError,
  onRetry,
  className,
}: {
  title: string;
  value: ReactNode;
  helper?: ReactNode;
  icon: TIcon;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-24" />
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
        </div>
      </CardContent>
    </Card>
  );
}

/** Bordered panel with loading / error / empty states. */
export function DashboardPanel({
  title,
  description,
  actions,
  isLoading,
  isError,
  onRetry,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center">
            <TriangleAlert className="size-5 text-destructive" />
            <p className="text-sm font-medium">Could not load this section</p>
            {onRetry ? (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="size-3.5" />
                Retry
              </Button>
            ) : null}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed px-4 py-6 text-center">
            <Inbox className="size-4 text-muted-foreground/60" />
            <p className="text-sm font-medium">{emptyTitle}</p>
            {emptyDescription ? (
              <p className="text-xs text-muted-foreground">{emptyDescription}</p>
            ) : null}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export type TActionItem = {
  key: string;
  label: string;
  href: string;
  count?: number;
  helper?: string;
  severity?: "info" | "warning" | "error";
};

/** "Needs your action" list with links. */
export function ActionList({ items }: { items: TActionItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        You are all caught up.
      </p>
    );
  }
  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            to={item.href}
            className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-primary"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  item.severity === "error"
                    ? "bg-destructive"
                    : item.severity === "warning"
                      ? "bg-amber-500"
                      : "bg-primary",
                )}
              />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
              {typeof item.count === "number" ? (
                <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                  {item.count}
                </span>
              ) : null}
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
          {item.helper ? (
            <p className="-mt-1 pb-2 pl-4 text-xs text-muted-foreground">
              {item.helper}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** Quick links row used by every dashboard. */
export function QuickLinks({
  links,
}: {
  links: { key: string; label: string; href: string; icon: LucideIcon }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Button key={link.key} asChild variant="outline" size="sm">
          <Link to={link.href}>
            <link.icon className="size-3.5" />
            {link.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}

/** Compact bar chart (recharts) used for the dashboard trend cards. */
export function MiniBarChart({
  data,
  xKey,
  series,
  height = 240,
}: {
  data: Array<Record<string, string | number>>;
  xKey: string;
  series: { key: string; label: string; color: string }[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.color}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
