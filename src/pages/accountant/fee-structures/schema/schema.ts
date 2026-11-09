import { z } from "zod";

export const feeStructureCreateSchema = z.object({
  courseName: z.string().trim().min(1, "Course name is required"),
  batchId: z.string().optional().or(z.literal("")),
  termLabel: z.string().trim().min(1, "Term label is required"),
  feeHeadCode: z.string().trim().min(1, "Fee head is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
});

export const feeStructureAssignSchema = z.object({
  studentId: z.string().uuid("Select a student"),
});

export type FeeStructureCreateValues = z.infer<typeof feeStructureCreateSchema>;
export type FeeStructureAssignValues = z.infer<typeof feeStructureAssignSchema>;
