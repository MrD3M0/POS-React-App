import { z } from "zod";

const bsDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format");
const dayOfWeekSchema = z.enum([
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
], { message: "dayOfWeek must be one of SUNDAY..SATURDAY" });

export const classScheduleCreateSchema = z.object({
  teachingAssignmentId: z.string().uuid("Select a teaching assignment"),
  periodId: z.string().uuid("Select a period"),
  dayOfWeek: dayOfWeekSchema,
  room: z.string().max(50, "Room is too long").optional(),
  effectiveFromBs: bsDate,
  // Optional: blank string allowed so the picker's empty state passes.
  effectiveToBs: bsDate.or(z.literal("")).optional(),
  // Plain boolean (no .default()) so the zodResolver input/output types match.
  isActive: z.boolean(),
});

export type ClassScheduleCreateFormValues = z.infer<typeof classScheduleCreateSchema>;

export const classScheduleCreateDefaultValues: ClassScheduleCreateFormValues = {
  teachingAssignmentId: "",
  periodId: "",
  dayOfWeek: "MONDAY",
  room: "",
  effectiveFromBs: "",
  effectiveToBs: "",
  isActive: true,
};