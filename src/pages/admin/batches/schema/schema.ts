import { z } from "zod";

export const batchSchema = z.object({
  courseId: z.string().uuid("Please select a course"),
  name: z.string().trim().min(1, "Batch name is required").max(100, "Batch name is too long"),
  startDateBs: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format")
    .optional()
    .or(z.literal("")),
  currentTermNumber: z.number().int().min(1, "Term number must be at least 1").max(20, "Term number is too high"),
  isActive: z.boolean(),
});

export type BatchFormValues = z.infer<typeof batchSchema>;

export const batchDefaultValues: BatchFormValues = {
  courseId: "",
  name: "",
  startDateBs: "",
  currentTermNumber: 1,
  isActive: true,
};
