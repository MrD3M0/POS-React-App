import { z } from "zod";

export const termSchema = z.object({
  batchId: z.string().uuid("Please select a batch"),
  termNumber: z.number().int().min(1, "Term number must be at least 1").max(20, "Term number is too high"),
  name: z.string().trim().min(1, "Term name is required").max(100, "Term name is too long"),
  startDateBs: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format")
    .optional()
    .or(z.literal("")),
  endDateBs: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

export type TermFormValues = z.infer<typeof termSchema>;

export const termDefaultValues: TermFormValues = {
  batchId: "",
  termNumber: 1,
  name: "",
  startDateBs: "",
  endDateBs: "",
  isActive: true,
};
