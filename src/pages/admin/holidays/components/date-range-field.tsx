import { BsDatePicker } from "@/components/bs-datepicker";
import { enumerateBsDateRange } from "@/lib/bs-date-range";
import { cn } from "@/lib/utils";

export interface DateRangeValue {
  fromBs: string;
  toBs: string;
}

type DateRangeFieldProps = {
  value: DateRangeValue;
  /** Called with the full patch ({ fromBs } or { toBs }) after a picker change. */
  onChange: (patch: Partial<DateRangeValue>) => void;
  /** Errors keyed by field, e.g. { toBs: "To date must be on or after the From date" }. */
  errors?: Partial<Record<keyof DateRangeValue, string>>;
  disabled?: boolean;
};

/**
 * From/To (BS) pickers for the "Date range" holiday mode, with a live
 * day-count between the two dates.
 */
export default function DateRangeField({
  value,
  onChange,
  errors,
  disabled,
}: DateRangeFieldProps) {
  const dayCount = countDays(value.fromBs, value.toBs);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-sm font-medium">From (BS) *</span>
          <BsDatePicker
            value={value.fromBs}
            onChange={(next) => onChange({ fromBs: typeof next === "string" ? next : "" })}
            valueFormat="bs"
            lang="en"
            placeholder="Select start date (BS)"
            disabled={disabled}
          />
          {errors?.fromBs ? (
            <p className="text-sm font-medium text-destructive">{errors.fromBs}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium">To (BS) *</span>
          <BsDatePicker
            value={value.toBs}
            onChange={(next) => onChange({ toBs: typeof next === "string" ? next : "" })}
            valueFormat="bs"
            lang="en"
            placeholder="Select end date (BS)"
            disabled={disabled}
          />
          {errors?.toBs ? (
            <p className="text-sm font-medium text-destructive">{errors.toBs}</p>
          ) : null}
        </div>
      </div>

      <p
        className={cn(
          "text-xs",
          dayCount === null ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {dayCount === null
          ? "Pick both dates to see the number of days."
          : `Covers ${dayCount} day${dayCount === 1 ? "" : "s"}.`}
      </p>
    </div>
  );
}

/** Inclusive day count, or null when the range is incomplete/inverted. */
function countDays(fromBs: string, toBs: string): number | null {
  if (!fromBs || !toBs || toBs < fromBs) return null;
  try {
    return enumerateBsDateRange(fromBs, toBs).length;
  } catch {
    return null;
  }
}
