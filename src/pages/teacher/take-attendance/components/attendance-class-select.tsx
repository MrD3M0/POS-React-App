import { formatBs, todayBs } from "@/lib/bs-date";
import { Check } from "lucide-react";
import { BsDatePicker } from "@/components/bs-datepicker";
import Button from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { T_AttendanceSelection } from "../hooks/use-attendance-data";
import type { T_PERIOD, T_TEACHER_ASSIGNMENT } from "../service/service";

type T_Props = {
  assignments: T_TEACHER_ASSIGNMENT[];
  periods: T_PERIOD[];
  value: T_AttendanceSelection;
  onChange: (patch: Partial<T_AttendanceSelection>) => void;
  onContinue: () => void;
};

export function AttendanceClassSelect({
  assignments,
  periods,
  value,
  onChange,
  onContinue,
}: T_Props) {
  const today = formatBs(todayBs());
  const canContinue = Boolean(value.assignmentId && value.periodId && value.dateBs);

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <p className="text-sm font-medium">Class</p>
        <div className="space-y-2">
          {assignments.map((assignment) => {
            const selected = assignment.id === value.assignmentId;
            return (
              <button
                key={assignment.id}
                type="button"
                onClick={() => onChange({ assignmentId: assignment.id })}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
                  selected
                    ? "border-primary ring-2 ring-primary"
                    : "border-border hover:bg-muted",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {assignment.batchTermSubject?.subject?.name ?? "Subject"}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[
                      assignment.batchTermSubject?.batchTerm?.batch?.name,
                      assignment.batchTermSubject?.batchTerm?.name,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {selected ? <Check className="size-4 shrink-0 text-primary" /> : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm font-medium">Period</p>
        <div className="flex flex-wrap gap-2">
          {periods.map((period) => {
            const selected = period.id === value.periodId;
            return (
              <Button
                key={period.id}
                type="button"
                variant="outline"
                size="md"
                aria-pressed={selected}
                onClick={() => onChange({ periodId: period.id })}
                className={cn(
                  "rounded-full",
                  selected && "border-primary bg-primary/10 text-primary",
                )}
              >
                {period.name ?? `Period ${period.periodNumber ?? ""}`}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="space-y-1.5">
        <Label>Date (BS)</Label>
        <BsDatePicker
          value={value.dateBs}
          onChange={(next) => onChange({ dateBs: typeof next === "string" ? next : "" })}
          valueFormat="bs"
          lang="en"
          maxDate={today}
          className="w-full justify-start font-normal"
        />
      </section>

      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!canContinue}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  );
}
