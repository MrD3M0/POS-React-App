import { useState } from "react";
import { Undo2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AttendanceReview } from "./attendance-review";
import { AttendanceRoundButtons } from "./attendance-status-buttons";
import {
  ATTENDANCE_STATUS_META,
  type TAttendanceCounts,
  type TAttendanceStatus,
} from "../attendance-status";
import { studentFullName, studentInitials } from "../attendance-utils";
import {
  SWIPE_COMMIT_DISTANCE,
  SWIPE_DIRECTION_STATUS,
  useSwipeCard,
} from "../hooks/use-swipe-card";
import { usePrefersReducedMotion } from "../hooks/use-media-query";
import type { T_DraftMap } from "../hooks/use-attendance-draft";
import type { T_ROSTER_ENTRY } from "../service/service";

const SWIPE_BUTTON_ORDER: readonly TAttendanceStatus[] = [
  "ABSENT",
  "LEAVE",
  "LATE",
  "PRESENT",
];

type T_Props = {
  rows: T_ROSTER_ENTRY[];
  draft: T_DraftMap;
  counts: TAttendanceCounts;
  onStatus: (studentId: string, status: TAttendanceStatus) => void;
  onRemarks: (studentId: string, remarks: string) => void;
  resetStatus: (studentId: string) => void;
  invalidIds: string[];
  showErrors: boolean;
  disabled: boolean;
  saving: boolean;
  onSave: () => void;
};

export function AttendanceSwipeView({
  rows,
  draft,
  counts,
  onStatus,
  onRemarks,
  resetStatus,
  invalidIds,
  showErrors,
  disabled,
  saving,
  onSave,
}: T_Props) {
  const [index, setIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const reducedMotion = usePrefersReducedMotion();

  const current = rows[index];
  const next = rows[index + 1];

  const commitStatus = (status: TAttendanceStatus) => {
    if (disabled || !current) return;
    onStatus(current.student.id, status);
    setAnnouncement(
      `${studentFullName(current.student)} marked ${ATTENDANCE_STATUS_META[status].label}`,
    );
    setIndex((previous) => previous + 1);
  };

  const swipe = useSwipeCard({
    disabled: disabled || !current,
    reducedMotion,
    onCommit: commitStatus,
  });

  const total = rows.length;
  const position = Math.min(index, total);

  const handleUndo = () => {
    if (index === 0) return;
    const target = rows[index - 1];
    setIndex(index - 1);
    if (!target) return;
    resetStatus(target.student.id);
    setAnnouncement(`Undid ${studentFullName(target.student)}`);
  };

  if (total === 0) {
    return (
      <p className="rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
        No approved students in this batch.
      </p>
    );
  }

  if (position >= total) {
    return (
      <AttendanceReview
        rows={rows}
        draft={draft}
        counts={counts}
        onStatus={onStatus}
        onRemarks={onRemarks}
        invalidIds={invalidIds}
        showErrors={showErrors}
        disabled={disabled}
        saving={saving}
        onSave={onSave}
        onRedo={() => {
          setIndex(0);
          setAnnouncement("");
        }}
      />
    );
  }

  const stampStatus = swipe.direction
    ? SWIPE_DIRECTION_STATUS[swipe.direction]
    : null;
  const stampHero = stampStatus ? ATTENDANCE_STATUS_META[stampStatus] : null;
  const stampOpacity = Math.min(1, swipe.distance / SWIPE_COMMIT_DISTANCE);
  const rotation = swipe.offset.x / 18;
  const transition = swipe.isDragging
    ? ""
    : swipe.exiting
      ? "transition-transform duration-200 ease-out"
      : "transition-transform duration-300 ease-out";

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {position + 1} of {total}
          </span>
          <span>{studentFullName(current.student)}</span>
        </div>
        <Progress value={total === 0 ? 0 : (position / total) * 100} />
      </div>

      <div className="relative">
        {next ? (
          <div
            aria-hidden
            className="absolute inset-x-4 top-2 h-full scale-[0.97] rounded-xl border bg-card"
          />
        ) : null}

        <div
          {...swipe.handlers}
          tabIndex={0}
          role="group"
          aria-label={`Attendance card for ${studentFullName(current.student)}`}
          style={{
            transform: `translate3d(${swipe.offset.x}px, ${swipe.offset.y}px, 0) rotate(${rotation}deg)`,
          }}
          className={cn(
            "relative touch-none select-none rounded-xl border bg-card px-5 py-8 text-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
            transition,
            reducedMotion && "transition-none",
          )}
        >
          {stampHero ? (
            <Badge
              className={cn(
                "pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 text-sm",
                stampHero.chipClass,
              )}
              style={{ opacity: stampOpacity }}
            >
              {stampHero.label}
            </Badge>
          ) : null}

          <Avatar className="mx-auto size-16">
            {current.student.photoUrl ? (
              <AvatarImage
                src={current.student.photoUrl}
                alt={studentFullName(current.student)}
              />
            ) : null}
            <AvatarFallback className="text-base">
              {studentInitials(current.student)}
            </AvatarFallback>
          </Avatar>
          <p className="mt-4 text-lg font-medium">
            {studentFullName(current.student)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {current.student.universityRegNo}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <AttendanceRoundButtons
          value={draft[current.student.id]?.status ?? "PRESENT"}
          onChange={commitStatus}
          disabled={disabled}
          order={SWIPE_BUTTON_ORDER}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={index === 0}
        >
          <Undo2 />
          Undo
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Swipe right present, left absent, up leave, down half day
      </p>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
