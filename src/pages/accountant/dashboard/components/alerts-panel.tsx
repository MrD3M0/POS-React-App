import { Link } from "react-router-dom";
import { Bell, CircleAlert, Megaphone, TriangleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  WidgetEmpty,
  WidgetError,
  WidgetSkeleton,
} from "@/components/common/widget-state";
import type {
  T_DashboardAlert,
  T_PayrollAndAlerts,
} from "../service/service";

/** What needs attention right now + the latest notices of the college. */
export default function AlertsPanel({
  data,
  isLoading,
  isError,
  onRetry,
}: {
  data: T_PayrollAndAlerts | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
}) {
  const alerts: T_DashboardAlert[] = data?.alerts ?? [];
  const notices = data?.notices ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4" />
          Alerts &amp; Notices
        </CardTitle>
        <CardDescription>
          What is waiting for you, and the latest notices of the college.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <WidgetSkeleton rows={4} />
        ) : isError ? (
          <WidgetError onRetry={onRetry} />
        ) : (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                NEEDS ATTENTION
              </p>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing is waiting for you right now.
                </p>
              ) : (
                <ul className="space-y-2">
                  {alerts.map((alert) => (
                    <li key={alert.key}>
                      <Link
                        to={alert.link}
                        className="flex items-start gap-2 rounded-md border p-2.5 transition-colors duration-150 hover:bg-accent"
                      >
                        <TriangleAlert
                          className={
                            alert.severity === "error"
                              ? "mt-0.5 size-4 text-destructive"
                              : "mt-0.5 size-4 text-amber-600"
                          }
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {alert.label}
                          </span>
                        </span>
                        <Badge variant="outline">{alert.count}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                LATEST NOTICES
              </p>
              {notices.length === 0 ? (
                <WidgetEmpty title="No notice yet" />
              ) : (
                <ul className="space-y-2">
                  {notices.map((notice) => (
                    <li
                      key={notice.id}
                      className="flex items-start gap-2 rounded-md border p-2.5"
                    >
                      <Megaphone className="mt-0.5 size-4 text-primary" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {notice.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {notice.role
                            ? `by ${notice.role.toLowerCase()}`
                            : "by the college"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
