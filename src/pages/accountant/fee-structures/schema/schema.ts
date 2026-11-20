import { z } from "zod";

export const feeStructureItemSchema = z.object({
  feeHeadId: z.string().min(1, "Select a fee head"),
  /** null = one-time fee (e.g. the admission fee). */
  termNumber: z.number().int().min(1).nullable(),
  amount: z
    .number({ message: "Enter an amount" })
    .positive("Amount must be greater than 0"),
});

export const feeStructureCreateSchema = z
  .object({
    courseId: z.string().min(1, "Select a course"),
    /** empty = the default structure of the course. */
    batchId: z.string().optional().or(z.literal("")),
    name: z.string().trim().min(1, "Name is required").max(150),
    isActive: z.boolean(),
    items: z.array(feeStructureItemSchema).min(1, "Add at least one fee item"),
  })
  .superRefine((data, ctx) => {
    // The backend enforces unique (structure, fee head, term) rows — catch
    // duplicates inline instead of a 409 after submit.
    const seen = new Set<string>();
    data.items.forEach((item, index) => {
      const key = `${item.feeHeadId}|${item.termNumber ?? "one-time"}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["items", index],
          message: "This fee head is already added for this term.",
        });
      }
      seen.add(key);
    });
  });

export type FeeStructureCreateValues = z.infer<
  typeof feeStructureCreateSchema
>;

export const feeStructureCreateDefaultValues: FeeStructureCreateValues = {
  courseId: "",
  batchId: "",
  name: "",
  isActive: true,
  // NaN = empty input (the field starts blank, never showing a fake 0).
  items: [{ feeHeadId: "", termNumber: null, amount: NaN }],
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
