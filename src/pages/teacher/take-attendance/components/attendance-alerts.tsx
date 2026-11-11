import { CalendarDays, Info, Lock, RefreshCw, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiErrorMessage } from "../attendance-utils";
import type { T_HOLIDAY } from "../service/service";

type T_AlertsProps = {
  holiday: T_HOLIDAY | null;
  isLocked: boolean;
  error: unknown;
  onRetry: () => void;
};

export function AttendanceSheetAlerts({ holiday, isLocked, error, onRetry }: T_AlertsProps) {
  return (
    <div className="space-y-2">
      {error ? (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
          <TriangleAlert />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <AlertTitle>Attendance could not be loaded</AlertTitle>
              <AlertDescription>
                {apiErrorMessage(error, "Check your connection and try again.")}
              </AlertDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw />
              Retry
            </Button>
          </div>
        </Alert>
      ) : null}

      {holiday ? (
        <Alert className="border-amber-600/30 bg-amber-500/10 text-amber-800 dark:text-amber-300">
          <CalendarDays />
          <AlertTitle>Holiday: {holiday.name}</AlertTitle>
          <AlertDescription className="text-amber-700/90 dark:text-amber-300/80">
            Attendance cannot be saved on a student holiday.
          </AlertDescription>
        </Alert>
      ) : null}

      {isLocked ? (
        <Alert>
          <Lock />
          <AlertTitle>This attendance is locked</AlertTitle>
          <AlertDescription>
            The edit window has passed. Ask the principal or an admin to unlock this session.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

export function SavedSessionBadge() {
  return (
    <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
      <Info className="size-3" />
      Editing saved attendance
    </Badge>
  );
}
