import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Input from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AttendanceRoundButtons } from "./attendance-status-buttons";
import { studentFullName, studentInitials } from "../attendance-utils";
import type { T_DraftMap } from "../hooks/use-attendance-draft";
import type { T_ROSTER_ENTRY } from "../service/service";
import type { TAttendanceStatus } from "../attendance-status";

type T_Props = {
  rows: T_ROSTER_ENTRY[];
  draft: T_DraftMap;
  onStatus: (studentId: string, status: TAttendanceStatus) => void;
  onRemarks: (studentId: string, remarks: string) => void;
  invalidIds: string[];
  showErrors: boolean;
  disabled: boolean;
};

export function AttendanceListView({
  rows,
  draft,
  onStatus,
  onRemarks,
  invalidIds,
  showErrors,
  disabled,
}: T_Props) {
  return (
    <div className="rounded-lg border">
      {rows.map((row) => {
        const entry = draft[row.student.id];
        const status = entry?.status ?? "PRESENT";
        const isLeave = status === "LEAVE";
        const showError = isLeave && invalidIds.includes(row.student.id) && showErrors;
        return (
          <div key={row.student.id} className="border-b px-3 py-3 last:border-b-0">
            <div className="flex items-center gap-3">
              <Avatar>
                {row.student.photoUrl ? (
                  <AvatarImage
                    src={row.student.photoUrl}
                    alt={studentFullName(row.student)}
                  />
                ) : null}
                <AvatarFallback className="text-[11px]">
                  {studentInitials(row.student)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
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
              <div className="mt-2 pl-[52px]">
                <Input
                  variant="sm"
                  value={entry?.remarks ?? ""}
                  onChange={(event) => onRemarks(row.student.id, event.target.value)}
                  placeholder="Reason for leave"
                  aria-label={`Remarks for ${studentFullName(row.student)}`}
                  aria-invalid={showError}
                  data-remarks-input={row.student.id}
                  maxLength={500}
                  disabled={disabled}
                  className={cn(showError && "border-destructive/60")}
                />
                {showError ? (
                  <p className="mt-1 text-xs text-destructive">Remarks are required</p>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
