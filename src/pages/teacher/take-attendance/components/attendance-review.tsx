import { RotateCcw } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AttendanceRoundButtons } from "./attendance-status-buttons";
import { AttendanceSummary } from "./attendance-summary";
import { studentFullName } from "../attendance-utils";
import type { TAttendanceCounts, TAttendanceStatus } from "../attendance-status";
import type { T_DraftMap } from "../hooks/use-attendance-draft";
import type { T_ROSTER_ENTRY } from "../service/service";

type T_Props = {
  rows: T_ROSTER_ENTRY[];
  draft: T_DraftMap;
  counts: TAttendanceCounts;
  onStatus: (studentId: string, status: TAttendanceStatus) => void;
  onRemarks: (studentId: string, remarks: string) => void;
  invalidIds: string[];
  showErrors: boolean;
  disabled: boolean;
  saving: boolean;
  onSave: () => void;
  onRedo: () => void;
};

export function AttendanceReview({
  rows,
  draft,
  counts,
  onStatus,
  onRemarks,
  invalidIds,
  showErrors,
  disabled,
  saving,
  onSave,
  onRedo,
}: T_Props) {
  const exceptions = rows.filter(
    (row) => (draft[row.student.id]?.status ?? "PRESENT") !== "PRESENT",
  );

  return (
    <div className="space-y-4">
      <AttendanceSummary counts={counts} compact />

      <div className="space-y-2">
        <p className="text-sm font-medium">Non-present students</p>
        {exceptions.length === 0 ? (
          <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            All students are marked present.
          </p>
        ) : (
          <div className="rounded-lg border">
            {exceptions.map((row) => {
              const entry = draft[row.student.id];
              const status = entry?.status ?? "PRESENT";
              const isLeave = status === "LEAVE";
              const showError =
                isLeave && invalidIds.includes(row.student.id) && showErrors;
              return (
                <div
                  key={row.student.id}
                  className="space-y-2 border-b px-3 py-3 last:border-b-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {studentFullName(row.student)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.student.universityRegNo}
                      </p>
                    </div>
                    <AttendanceRoundButtons
                      value={status}
                      onChange={(next) => onStatus(row.student.id, next)}
                      disabled={disabled}
                    />
                  </div>
                  {isLeave ? (
                    <div>
                      <Input
                        variant="sm"
                        value={entry?.remarks ?? ""}
                        onChange={(event) =>
                          onRemarks(row.student.id, event.target.value)
                        }
                        placeholder="Reason for leave"
                        aria-label={`Remarks for ${studentFullName(row.student)}`}
                        aria-invalid={showError}
                        data-remarks-input={row.student.id}
                        maxLength={500}
                        disabled={disabled}
                        className={cn(showError && "border-destructive/60")}
                      />
                      {showError ? (
                        <p className="mt-1 text-xs text-destructive">
                          Remarks are required
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onRedo} disabled={saving}>
          <RotateCcw />
          Redo
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          loading={saving}
          disabled={disabled || rows.length === 0}
          onClick={onSave}
        >
          Save attendance
        </Button>
      </div>
    </div>
  );
}
