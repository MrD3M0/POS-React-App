import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import { enumerateBsDateRange, filterBsDatesByWeekdays } from "@/lib/bs-date-range";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BsDatePicker } from "@/components/bs-datepicker";
import { bulkCreateHolidays } from "../service/service";

/** AD weekday indices (0 = Sunday ... 6 = Saturday). */
const WEEKDAY_OPTIONS: readonly { value: number; label: string; full: string }[] = [
  { value: 0, label: "Su", full: "Sunday" },
  { value: 1, label: "Mo", full: "Monday" },
  { value: 2, label: "Tu", full: "Tuesday" },
  { value: 3, label: "We", full: "Wednesday" },
  { value: 4, label: "Th", full: "Thursday" },
  { value: 5, label: "Fr", full: "Friday" },
  { value: 6, label: "Sa", full: "Saturday" },
];

type GenerateWeekdaysDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful generate (parent refreshes). */
  onDone: () => void;
};

/**
 * Replaces the old "Generate Saturdays" prompt: pick a BS date range and the
 * weekday(s) to turn into holidays (Saturday by default), see the preview
 * count, then create them through the same bulk endpoint. Existing dates are
 * skipped by the backend.
 */
export default function GenerateWeekdaysDialog({
  open,
  onOpenChange,
  onDone,
}: GenerateWeekdaysDialogProps) {
  const [startBs, setStartBs] = useState("");
  const [endBs, setEndBs] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([6]);
  const [name, setName] = useState("Saturday");

  const dates = useMemo(() => {
    if (!startBs || !endBs || endBs < startBs) return [];
    try {
      return filterBsDatesByWeekdays(enumerateBsDateRange(startBs, endBs), weekdays);
    } catch {
      return [];
    }
  }, [startBs, endBs, weekdays]);

  const mutation = useMutation({
    mutationFn: () =>
      bulkCreateHolidays({
        name: name.trim() || "Weekly off",
        type: "WEEKLY",
        dates,
        appliesToEmployees: true,
        appliesToStudents: true,
      }),
    onSuccess: (result) => {
      const created = result.data?.created ?? dates.length;
      const skipped = result.data?.skipped ?? 0;
      toast.success(`${created} holidays added, ${skipped} skipped`);
      onOpenChange(false);
      onDone();
    },
    onError: (error) => {
      const message =
        (error as AxiosError<{ message?: string }>).response?.data?.message ||
        "Failed to generate weekly offs.";
      toast.error(message);
    },
  });

  const toggleWeekday = (value: number) => {
    setWeekdays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value].sort((a, b) => a - b),
    );
  };

  const reset = () => {
    setStartBs("");
    setEndBs("");
    setWeekdays([6]);
    setName("Saturday");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate weekly offs</DialogTitle>
          <DialogDescription>
            Turn every selected weekday in a BS date range into a holiday. Dates that
            already have a holiday are skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-sm font-medium">Start date (BS) *</span>
              <BsDatePicker
                value={startBs}
                onChange={(v) => setStartBs(typeof v === "string" ? v : "")}
                valueFormat="bs"
                lang="en"
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-sm font-medium">End date (BS) *</span>
              <BsDatePicker
                value={endBs}
                onChange={(v) => setEndBs(typeof v === "string" ? v : "")}
                valueFormat="bs"
                lang="en"
                placeholder="Select end date"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Weekday(s)</span>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAY_OPTIONS.map((option) => {
                const active = weekdays.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    title={option.full}
                    aria-pressed={active}
                    onClick={() => toggleWeekday(option.value)}
                    className={cn(
                      "size-9 rounded-md border text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      option.value === 6 && !active && "text-destructive",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-sm font-medium">Holiday name</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Saturday"
            />
          </div>

          {/* Preview */}
          <div className="rounded-md border bg-muted/30 px-3 py-2.5">
            <p className="text-sm font-medium">
              This will create{" "}
              <span className="tabular-nums">{dates.length}</span> holiday
              {dates.length === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {startBs && endBs && dates.length === 0
                ? "No matching dates in this range."
                : "Dates that already exist as holidays will be skipped."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            loading={mutation.isPending}
            disabled={dates.length === 0}
            onClick={() => mutation.mutate()}
          >
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
