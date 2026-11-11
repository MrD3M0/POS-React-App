import { CheckCheck } from "lucide-react";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AttendanceCountStrip } from "./attendance-summary";
import type { TAttendanceCounts } from "../attendance-status";

type T_Props = {
  counts: TAttendanceCounts;
  total: number;
  saving: boolean;
  disabled: boolean;
  onSave: () => void;
  onMarkAllPresent?: () => void;
  variant: "desktop" | "mobile";
};

export function AttendanceSaveBar({
  counts,
  total,
  saving,
  disabled,
  onSave,
  onMarkAllPresent,
  variant,
}: T_Props) {
  if (variant === "mobile") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <AttendanceCountStrip counts={counts} />
          <Button
            type="button"
            size="md"
            loading={saving}
            disabled={disabled || total === 0}
            onClick={onSave}
          >
            Save attendance
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-5 mt-1 flex flex-wrap items-center justify-between gap-3",
        "border-t bg-background px-5 py-3",
      )}
    >
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {counts.PRESENT} of {total} present
        </p>
        <AttendanceCountStrip counts={counts} />
      </div>
      <div className="flex items-center gap-2">
        {onMarkAllPresent ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onMarkAllPresent}
            disabled={disabled || saving}
          >
            <CheckCheck />
            Mark all present
          </Button>
        ) : null}
        <Button
          type="button"
          variant="primary"
          size="md"
          loading={saving}
          disabled={disabled || total === 0}
          onClick={onSave}
        >
          Save attendance
        </Button>
      </div>
    </div>
  );
}
