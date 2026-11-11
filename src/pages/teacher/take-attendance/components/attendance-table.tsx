import Input from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AttendanceToggleGroup } from "./attendance-status-buttons";
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

export function AttendanceTable({
  rows,
  draft,
  onStatus,
  onRemarks,
  invalidIds,
  showErrors,
  disabled,
}: T_Props) {
  return (
    <div className="max-h-[60vh] overflow-auto rounded-lg border [&_[data-slot=table-container]]:overflow-x-visible [&_[data-slot=table-container]]:overflow-y-visible">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead className="min-w-[120px]">Reg no</TableHead>
            <TableHead className="min-w-[220px]">Student</TableHead>
            <TableHead className="min-w-[170px]">Status</TableHead>
            <TableHead className="min-w-[220px]">Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const entry = draft[row.student.id];
            const status = entry?.status ?? "PRESENT";
            const isLeave = status === "LEAVE";
            const invalid = invalidIds.includes(row.student.id);
            const showError = isLeave && invalid && showErrors;
            return (
              <TableRow key={row.student.id}>
                <TableCell className="text-muted-foreground tabular-nums">
                  {index + 1}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {row.student.universityRegNo}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      {row.student.photoUrl ? (
                        <AvatarImage
                          src={row.student.photoUrl}
                          alt={studentFullName(row.student)}
                        />
                      ) : null}
                      <AvatarFallback className="text-[10px]">
                        {studentInitials(row.student)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">
                      {studentFullName(row.student)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <AttendanceToggleGroup
                    value={status}
                    onChange={(next) => onStatus(row.student.id, next)}
                    disabled={disabled}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    variant="sm"
                    value={entry?.remarks ?? ""}
                    onChange={(event) => onRemarks(row.student.id, event.target.value)}
                    placeholder={isLeave ? "Reason for leave" : "—"}
                    aria-label={`Remarks for ${studentFullName(row.student)}`}
                    aria-invalid={showError}
                    data-remarks-input={row.student.id}
                    maxLength={500}
                    disabled={disabled || !isLeave}
                    className={cn(showError && "border-destructive/60")}
                  />
                  {showError ? (
                    <p className="mt-1 text-xs text-destructive">Remarks are required</p>
                  ) : null}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
