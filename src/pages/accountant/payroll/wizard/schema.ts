import { z } from "zod";

export const generatePayrollSchema = z.object({
  fiscalYearId: z.string().uuid("Fiscal year is required"),
  // The form converts the input to a number before it reaches the schema.
  yearBs: z.number().int().min(2000).max(2099),
  monthBs: z.number().int().min(1, "Month is required").max(12),
  remarks: z.string().max(1000).optional().nullable(),
});

export const payPayrollSchema = z.object({
  paidDateBs: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Paid date (BS) must be YYYY-MM-DD")
    .min(1, "Paid date (BS) is required"),
});

export type GeneratePayrollValues = z.infer<typeof generatePayrollSchema>;
export type PayPayrollValues = z.infer<typeof payPayrollSchema>;

export const BS_MONTH_OPTIONS = [
  { label: "Baisakh (1)", value: "1" },
  { label: "Jestha (2)", value: "2" },
  { label: "Ashadh (3)", value: "3" },
  { label: "Shrawan (4)", value: "4" },
  { label: "Bhadra (5)", value: "5" },
  { label: "Ashwin (6)", value: "6" },
  { label: "Kartik (7)", value: "7" },
  { label: "Mangsir (8)", value: "8" },
  { label: "Poush (9)", value: "9" },
  { label: "Magh (10)", value: "10" },
  { label: "Falgun (11)", value: "11" },
  { label: "Chaitra (12)", value: "12" },
];
