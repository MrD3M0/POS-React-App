import { z } from "zod";

export const rejectStudentSchema = z.object({
  reason: z.string().trim().min(1, "Rejection reason is required").max(1000),
});

export type RejectStudentFormValues = z.infer<typeof rejectStudentSchema>;
