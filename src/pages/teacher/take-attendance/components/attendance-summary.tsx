import { cn } from "@/lib/utils";
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_META,
  type TAttendanceCounts,
} from "../attendance-status";

export function AttendanceSummary({
  counts,
  compact = false,
}: {
  counts: TAttendanceCounts;
  compact?: boolean;
}) {
  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-4 gap-2" : "grid-cols-2 sm:grid-cols-4")}>
      {ATTENDANCE_STATUSES.map((status) => {
        const meta = ATTENDANCE_STATUS_META[status];
        const Icon = meta.icon;
        return (
          <div
            key={status}
            className={cn("rounded-lg border", meta.tileClass, compact ? "p-2" : "p-3")}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={cn("opacity-80", compact ? "text-[11px]" : "text-xs")}>
                {meta.label}
              </span>
              <Icon className="size-3.5 opacity-70" />
            </div>
            <p
              className={cn(
                "font-semibold tabular-nums",
                compact ? "text-lg" : "text-2xl",
              )}
            >
              {counts[status]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Compact P/A/L/H counters for the sticky mobile save bar. */
export function AttendanceCountStrip({ counts }: { counts: TAttendanceCounts }) {
  return (
    <div className="flex items-center gap-1.5">
      {ATTENDANCE_STATUSES.map((status) => {
        const meta = ATTENDANCE_STATUS_META[status];
        return (
          <span
            key={status}
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums",
              meta.chipClass,
            )}
            aria-label={`${meta.label}: ${counts[status]}`}
          >
            {meta.short} {counts[status]}
          </span>
        );
      })}
    </div>
  );
}
