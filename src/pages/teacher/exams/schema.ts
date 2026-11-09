import { z } from "zod";

export const examSchema = z
  .object({
    batchTermId: z.string().uuid("Batch term is required"),
    examTypeId: z.string().uuid("Exam type is required"),
    name: z.string().trim().min(1, "Exam name is required"),
    startDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid BS date").optional().or(z.literal("")),
    endDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid BS date").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.startDateBs && data.endDateBs && data.endDateBs < data.startDateBs) {
      ctx.addIssue({ code: "custom", path: ["endDateBs"], message: "End date must be on or after start date" });
    }
  });

export type ExamValues = z.infer<typeof examSchema>;
