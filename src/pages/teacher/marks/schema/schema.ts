import { z } from "zod";

export const marksEntrySchema = z.object({
  examId: z.string().uuid("Select an exam"),
  examSubjectId: z.string().uuid("Select an exam subject"),
});

export const markRowSchema = z.object({
  studentId: z.string().uuid(),
  examSubjectId: z.string().uuid(),
  marksObtained: z.union([z.number(), z.string()]).nullable().optional(),
  isAbsent: z.boolean().optional(),
  remarks: z.string().max(500).optional().nullable(),
});

export type MarksEntryValues = z.infer<typeof marksEntrySchema>;
export type MarkRowValues = z.infer<typeof markRowSchema>;
