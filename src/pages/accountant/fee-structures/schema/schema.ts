import { z } from "zod";

export const feeStructureItemSchema = z.object({
  feeHeadId: z.string().min(1, "Select a fee head"),
  /** null / empty = one-time fee (e.g. the admission fee). */
  termNumber: z
    .union([z.number().int().min(1), z.literal(""), z.null()])
    .optional()
    .transform((value) =>
      value === "" || value === null || value === undefined
        ? null
        : Number(value),
    ),
  amount: z.coerce
    .number({ invalid_type_error: "Enter an amount" })
    .positive("Amount must be greater than 0"),
});

export const feeStructureCreateSchema = z.object({
  courseId: z.string().min(1, "Select a course"),
  /** empty = the default structure of the course. */
  batchId: z.string().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Name is required").max(150),
  isActive: z.boolean(),
  items: z.array(feeStructureItemSchema).min(1, "Add at least one fee item"),
});

export type FeeStructureCreateValues = z.infer<
  typeof feeStructureCreateSchema
>;

export const feeStructureCreateDefaultValues: FeeStructureCreateValues = {
  courseId: "",
  batchId: "",
  name: "",
  isActive: true,
  items: [{ feeHeadId: "", termNumber: null, amount: 0 }],
};

export const feeStructureAssignSchema = z.object({
  studentId: z.string().min(1, "Select a student"),
});

export type FeeStructureAssignValues = z.infer<
  typeof feeStructureAssignSchema
>;

export const feeStructureAssignBatchSchema = z.object({
  batchId: z.string().min(1, "Select a batch"),
});

export type FeeStructureAssignBatchValues = z.infer<
  typeof feeStructureAssignBatchSchema
>;
