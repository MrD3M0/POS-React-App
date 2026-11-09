import { z } from "zod";

export const examSubjectSchema = z.object({
  examId: z.string().min(1, "Exam is required"),
  batchTermSubjectId: z.string().min(1, "Batch term subject is required"),
  fullMarks: z.string().min(1, "Full marks are required"),
  passMarks: z.string().min(1, "Pass marks are required"),
  examDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid BS date (YYYY-MM-DD)").optional().or(z.literal("")),
});

export type ExamSubjectValues = z.infer<typeof examSubjectSchema>;
