import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_META,
  INACTIVE_STATUS_BUTTON_CLASS,
  type TAttendanceStatus,
} from "../attendance-status";

type T_Props = {
  value: TAttendanceStatus;
  onChange: (status: TAttendanceStatus) => void;
  disabled?: boolean;
  /** Optional display order (defaults to P / A / L / H). */
  order?: readonly TAttendanceStatus[];
};

/** Desktop single-select P / A / L / H with tooltips. */
export function AttendanceToggleGroup({ value, onChange, disabled = false }: T_Props) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as TAttendanceStatus);
      }}
      disabled={disabled}
      aria-label="Attendance status"
    >
      {ATTENDANCE_STATUSES.map((status) => {
        const meta = ATTENDANCE_STATUS_META[status];
        const selected = status === value;
        return (
          <Tooltip key={status}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={status}
                aria-label={meta.label}
                className={cn(
                  "h-8 w-9 text-xs font-semibold",
                  selected ? meta.buttonClass : INACTIVE_STATUS_BUTTON_CLASS,
                )}
              >
                {meta.short}
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{meta.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </ToggleGroup>
  );
}

/** Round 36px touch targets for the mobile views. */
export function AttendanceRoundButtons({
  value,
  onChange,
  disabled = false,
  order = ATTENDANCE_STATUSES,
}: T_Props) {
  return (
    <div className="flex items-center gap-1.5">
      {order.map((status) => {
        const meta = ATTENDANCE_STATUS_META[status];
        const selected = status === value;
        return (
          <Button
            key={status}
            type="button"
            variant="outline"
            size="icon"
            shape="circle"
            aria-label={meta.label}
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(status)}
            className={cn(
              "size-9 text-xs font-semibold",
              selected ? meta.buttonClass : INACTIVE_STATUS_BUTTON_CLASS,
            )}
          >
            {meta.short}
          </Button>
        );
      })}
    </div>
  );
}
