import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { mapFieldsOnError } from "@/lib/utils";
import { enumerateBsDateRange, dedupeBsDates } from "@/lib/bs-date-range";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import {
  holidayFormSchema,
  holidayFormDefaultValues,
  HOLIDAY_TYPES,
  HOLIDAY_TYPE_LABELS,
  type HolidayFormValues,
} from "../schema/schema";
import { bulkCreateHolidays } from "../service/service";
import DateRangeField from "./date-range-field";
import MultiDatePicker from "./multi-date-picker";

const MODES: Readonly<{ value: HolidayFormValues["mode"]; label: string }[]> = [
  { value: "single", label: "Single day" },
  { value: "range", label: "Date range" },
  { value: "multi", label: "Pick multiple dates" },
];

type HolidayFormProps = {
  /** Pre-fills the single-day date (used when opened from the calendar). */
  initialDateBs?: string;
  /** Called after a successful bulk create (parent refreshes and closes). */
  onDone: () => void;
  onCancel: () => void;
};

/** The multi-day "Add holiday" form: shared name/type/description + one of three date modes. */
export default function HolidayForm({ initialDateBs, onDone, onCancel }: HolidayFormProps) {
  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: { ...holidayFormDefaultValues, dateBs: initialDateBs ?? "" },
  });

  const mode = useWatch({ control: form.control, name: "mode" });
  const dateBs = useWatch({ control: form.control, name: "dateBs" });
  const fromBs = useWatch({ control: form.control, name: "fromBs" });
  const toBs = useWatch({ control: form.control, name: "toBs" });
  const selectedDates = useWatch({ control: form.control, name: "selectedDates" });

  /** Dates that will be submitted for the current mode. */
  const previewDates = useMemo(() => {
    if (mode === "single") return dateBs ? [dateBs] : [];
    if (mode === "range") {
      if (!fromBs || !toBs || toBs < fromBs) return [];
      try {
        return enumerateBsDateRange(fromBs, toBs);
      } catch {
        return [];
      }
    }
    return dedupeBsDates(selectedDates);
  }, [mode, dateBs, fromBs, toBs, selectedDates]);

  const mutation = useMutation({
    mutationFn: (values: HolidayFormValues) =>
      bulkCreateHolidays({
        name: values.name,
        type: values.type,
        description: values.description ? values.description : undefined,
        dates: previewDates,
        appliesToEmployees: values.appliesToEmployees,
        appliesToStudents: values.appliesToStudents,
      }),
    onSuccess: (result) => {
      const created = result.data?.created ?? previewDates.length;
      const skipped = result.data?.skipped ?? 0;
      toast.success(`${created} holidays added, ${skipped} skipped`);
      onDone();
    },
    onError: (error) => {
      mapFieldsOnError(error as AxiosError<T_UseQueryError>, form.setError);
      const message =
        (error as AxiosError<{ message?: string }>).response?.data?.message ||
        "Failed to create holidays.";
      toast.error(message);
    },
  });

  const changeRange = (patch: { fromBs?: string; toBs?: string }) => {
    if (patch.fromBs !== undefined) form.setValue("fromBs", patch.fromBs, { shouldValidate: true });
    if (patch.toBs !== undefined) form.setValue("toBs", patch.toBs, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        {/* Mode toggle */}
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dates</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => field.onChange(m.value)}
                      className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                        field.value === m.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mode-specific date inputs */}
        {mode === "single" ? (
          <FormField
            control={form.control}
            name="dateBs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date (BS) *</FormLabel>
                <FormControl>
                  <BsDatePicker
                    value={field.value}
                    onChange={(value) => field.onChange(typeof value === "string" ? value : "")}
                    onBlur={field.onBlur}
                    valueFormat="bs"
                    lang="en"
                    placeholder="Select date (BS)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {mode === "range" ? (
          <DateRangeField
            value={{ fromBs, toBs }}
            onChange={changeRange}
            errors={{
              fromBs: form.formState.errors.fromBs?.message,
              toBs: form.formState.errors.toBs?.message,
            }}
          />
        ) : null}

        {mode === "multi" ? (
          <FormField
            control={form.control}
            name="selectedDates"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dates (BS) *</FormLabel>
                <FormControl>
                  <MultiDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        {/* Shared fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Dashain" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <SelectCommand
                    value={field.value}
                    onChange={field.onChange}
                    options={HOLIDAY_TYPES.map((type) => ({
                      label: HOLIDAY_TYPE_LABELS[type],
                      value: type,
                    }))}
                    placeholder="Select type"
                    hideSearch
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel isOptional>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Optional description applied to every date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-3">
          <FormField
            control={form.control}
            name="appliesToStudents"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                </FormControl>
                <FormLabel className="!mt-0 font-normal">Students</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appliesToEmployees"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                </FormControl>
                <FormLabel className="!mt-0 font-normal">Employees</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Live preview */}
        <div className="rounded-md border bg-muted/30 px-3 py-2.5">
          <p className="text-sm font-medium">
            This will create{" "}
            <span className="tabular-nums">{previewDates.length}</span> holiday
            {previewDates.length === 1 ? "" : "s"}
          </p>
          {previewDates.length > 0 ? (
            <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-auto">
              {previewDates.map((dateBs) => (
                <span
                  key={dateBs}
                  className="inline-flex items-center rounded-md border bg-background px-2 py-0.5 text-xs tabular-nums"
                >
                  {dateBs}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              No dates selected yet.
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Dates that already have a holiday are skipped.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending} disabled={previewDates.length === 0}>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
}
