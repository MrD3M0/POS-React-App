import { z } from "zod";

export const holidayFormSchema = z.object({
  dateBs: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format"),
  name: z.string().trim().min(1, "Holiday name is required").max(120, "Name is too long"),
  appliesToEmployees: z.boolean(),
  appliesToStudents: z.boolean(),
});

export type HolidayFormValues = z.infer<typeof holidayFormSchema>;
