import { z } from "zod";

export const generateResultSchema = z.object({
  examId: z.string().uuid("Exam is required"),
  studentId: z.string().uuid("Student is required"),
});

export type GenerateResultValues = z.infer<typeof generateResultSchema>;
