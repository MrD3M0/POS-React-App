import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { T_CLASS_SCHEDULE, T_PERIOD_OPTION } from "../service/service";

const DAYS = [
  { value: "SUNDAY", label: "Sun" },
  { value: "MONDAY", label: "Mon" },
  { value: "TUESDAY", label: "Tue" },
  { value: "WEDNESDAY", label: "Wed" },
  { value: "THURSDAY", label: "Thu" },
  { value: "FRIDAY", label: "Fri" },
  { value: "SATURDAY", label: "Sat" },
] as const;

type TGridView = "class" | "teacher";

function teacherName(schedule: T_CLASS_SCHEDULE): string {
  const e = schedule.teachingAssignment?.teacher?.employee;
  if (!e) return "—";
  return [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ") || "—";
}

function classLabel(schedule: T_CLASS_SCHEDULE): string {
  const bts = schedule.teachingAssignment?.batchTermSubject;
  if (!bts) return "—";
  const subject = bts.subject?.code ?? bts.subject?.name ?? "Subject";
  const batch = bts.batchTerm?.batch?.name;
  const term = bts.batchTerm?.termNumber ? `T${bts.batchTerm.termNumber}` : null;
  return [subject, batch, term].filter(Boolean).join(" · ");
}

/**
 * Weekly routine grid: periods down the side, days across the top.
 * Clicking a chip edits that schedule; clicking an empty cell creates a new
 * one for that period + day.
 */
export default function WeeklyGrid({
  schedules,
  periods,
  showSaturday,
  view,
  isLoading,
  onCreate,
  onEdit,
}: {
  schedules: T_CLASS_SCHEDULE[];
  periods: T_PERIOD_OPTION[];
  showSaturday: boolean;
  view: TGridView;
  isLoading?: boolean;
  onCreate: (dayOfWeek: string, periodId: string) => void;
  onEdit: (id: string) => void;
}) {
  const days = showSaturday ? DAYS : DAYS.slice(0, 6);
  const orderedPeriods = [...periods].sort((a, b) => a.periodNumber - b.periodNumber);

  if (isLoading) {
    return (
      <div className="space-y-2 rounded-xl border p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (orderedPeriods.length === 0) {
    return (
      <div className="grid min-h-40 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">
        No active periods. Add periods before building the routine.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid min-w-[720px] gap-px overflow-hidden rounded-xl border bg-border"
        style={{ gridTemplateColumns: `140px repeat(${days.length}, minmax(120px, 1fr))` }}
      >
        {/* Header row */}
        <div className="bg-muted/60 px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Period
        </div>
        {days.map((day) => (
          <div
            key={day.value}
            className={cn(
              "bg-muted/60 px-2 py-1.5 text-center text-xs font-medium text-muted-foreground",
              day.value === "SATURDAY" && "text-destructive/80",
            )}
          >
            {day.label}
          </div>
        ))}

        {/* Period rows */}
        {orderedPeriods.map((period) => (
          <div key={period.id} className="contents">
            <div className="flex flex-col justify-center bg-card px-2 py-2">
              <span className="text-xs font-medium">{period.name}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {period.startTime}–{period.endTime}
              </span>
            </div>

            {days.map((day) => {
              const cellSchedules = schedules.filter(
                (schedule) =>
                  schedule.periodId === period.id && schedule.dayOfWeek === day.value,
              );
              return (
                <div
                  key={`${period.id}-${day.value}`}
                  className="group/cell relative flex min-h-16 flex-col gap-1 bg-card p-1.5"
                >
                  {cellSchedules.map((schedule) => (
                    <button
                      key={schedule.id}
                      type="button"
                      onClick={() => onEdit(schedule.id)}
                      title={`${teacherName(schedule)} · ${classLabel(schedule)}${schedule.room ? ` · ${schedule.room}` : ""}`}
                      className={cn(
                        "rounded px-1.5 py-1 text-left text-[11px] leading-tight transition-opacity hover:opacity-80",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        schedule.isActive === false
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-foreground",
                      )}
                    >
                      <span className="block truncate font-medium">
                        {view === "teacher" ? teacherName(schedule) : classLabel(schedule)}
                      </span>
                      <span className="block truncate text-[10px] opacity-75">
                        {view === "teacher"
                          ? classLabel(schedule)
                          : teacherName(schedule)}
                        {schedule.room ? ` · ${schedule.room}` : ""}
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => onCreate(day.value, period.id)}
                    aria-label={`Add class on ${day.label}, ${period.name}`}
                    className={cn(
                      "flex items-center justify-center gap-1 rounded border border-dashed border-transparent text-[11px] text-muted-foreground",
                      "opacity-60 transition-opacity hover:bg-accent hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/cell:opacity-100",
                      cellSchedules.length > 0 ? "py-0.5" : "min-h-12",
                    )}
                  >
                    <Plus className="size-3" />
                    Add
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
