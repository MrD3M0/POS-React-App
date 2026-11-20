import { z } from "zod";
import { enumerateBsDateRange } from "@/lib/bs-date-range";

export const HOLIDAY_TYPES = ["PUBLIC", "SCHOOL", "WEEKLY"] as const;
export type T_HOLIDAY_TYPE_VALUE = (typeof HOLIDAY_TYPES)[number];

export const HOLIDAY_TYPE_LABELS: Record<T_HOLIDAY_TYPE_VALUE, string> = {
  PUBLIC: "Public",
  SCHOOL: "School",
  WEEKLY: "Weekly",
};

/** Hard cap per bulk request (matches the backend validator). */
export const HOLIDAY_MAX_DATES = 366;

const bsDateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD (BS)");

export const holidayFormSchema = z
  .object({
    /** "single" | "range" | "multi" — which date inputs apply. */
    mode: z.enum(["single", "range", "multi"]),
    dateBs: bsDateStr.or(z.literal("")),
    fromBs: bsDateStr.or(z.literal("")),
    toBs: bsDateStr.or(z.literal("")),
    /** Dates picked in "multi" mode. */
    selectedDates: z.array(bsDateStr),
    name: z.string().trim().min(1, "Holiday name is required").max(120, "Name is too long"),
    type: z.enum(HOLIDAY_TYPES),
    description: z.string().trim().max(500, "Description is too long").optional().or(z.literal("")),
    appliesToEmployees: z.boolean(),
    appliesToStudents: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const addIssue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message });

    if (values.mode === "single") {
      if (!values.dateBs) addIssue(["dateBs"], "Date is required");
      return;
    }

    if (values.mode === "range") {
      if (!values.fromBs) addIssue(["fromBs"], "From date is required");
      if (!values.toBs) addIssue(["toBs"], "To date is required");
      if (values.fromBs && values.toBs && values.toBs < values.fromBs) {
        addIssue(["toBs"], "To date must be on or after the From date");
        return;
      }
      if (values.fromBs && values.toBs) {
        try {
          const dates = enumerateBsDateRange(values.fromBs, values.toBs);
          if (dates.length > HOLIDAY_MAX_DATES) {
            addIssue(["toBs"], `Range covers ${dates.length} days — max ${HOLIDAY_MAX_DATES} per request`);
          }
        } catch {
          // Invalid BS dates are already reported by the regex checks above.
        }
      }
      return;
    }

    // mode === "multi"
    if (values.selectedDates.length < 1) {
      addIssue(["selectedDates"], "Pick at least one date");
    }
    if (new Set(values.selectedDates).size !== values.selectedDates.length) {
      addIssue(["selectedDates"], "Duplicate dates are not allowed");
    }
    if (values.selectedDates.length > HOLIDAY_MAX_DATES) {
      addIssue(["selectedDates"], `Max ${HOLIDAY_MAX_DATES} dates per request`);
    }
  });

export type HolidayFormValues = z.infer<typeof holidayFormSchema>;

export const holidayFormDefaultValues: HolidayFormValues = {
  mode: "single",
  dateBs: "",
  fromBs: "",
  toBs: "",
  selectedDates: [],
  name: "",
  type: "PUBLIC",
  description: "",
  appliesToEmployees: true,
  appliesToStudents: true,
};
