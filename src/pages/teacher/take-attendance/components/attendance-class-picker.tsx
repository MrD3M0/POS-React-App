import { formatBs, todayBs } from "@/lib/bs-date";
import { BsDatePicker } from "@/components/bs-datepicker";
import SelectCommand from "@/components/select-command";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { assignmentLabel, periodLabel } from "../attendance-utils";
import type { T_AttendanceSelection } from "../hooks/use-attendance-data";
import type { T_PERIOD, T_TEACHER_ASSIGNMENT } from "../service/service";

type T_Props = {
  assignments: T_TEACHER_ASSIGNMENT[];
  periods: T_PERIOD[];
  value: T_AttendanceSelection;
  onChange: (patch: Partial<T_AttendanceSelection>) => void;
  disabled?: boolean;
  loading?: boolean;
};

export function AttendanceClassPicker({
  assignments,
  periods,
  value,
  onChange,
  disabled = false,
  loading = false,
}: T_Props) {
  const today = formatBs(todayBs());

  const classOptions = assignments.map((assignment) => ({
    label: assignmentLabel(assignment),
    value: assignment.id,
  }));

  const periodOptions = periods.map((period) => ({
    label: periodLabel(period),
    value: period.id,
  }));

  return (
    <Card className="gap-0 rounded-lg border py-0 ring-0">
      <CardContent className="grid gap-4 px-4 py-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Class</Label>
          <SelectCommand
            value={value.assignmentId}
            onChange={(next) => onChange({ assignmentId: next })}
            options={classOptions}
            placeholder="Select class"
            searchPlaceholder="Search classes..."
            loading={loading}
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Period</Label>
          <SelectCommand
            value={value.periodId}
            onChange={(next) => onChange({ periodId: next })}
            options={periodOptions}
            placeholder="Select period"
            searchPlaceholder="Search periods..."
            loading={loading}
            hideSearch
            disabled={disabled}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Date (BS)</Label>
          <BsDatePicker
            value={value.dateBs}
            onChange={(next) => onChange({ dateBs: typeof next === "string" ? next : "" })}
            valueFormat="bs"
            lang="en"
            maxDate={today}
            className="w-full justify-start font-normal"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
