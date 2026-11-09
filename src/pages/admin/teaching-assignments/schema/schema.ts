import { z } from "zod";

const bsDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format");

export const teachingAssignmentCreateSchema = z.object({
  teacherId: z.string().uuid("Select a teacher"),
  batchTermSubjectId: z.string().uuid("Select a batch term subject"),
  assignedDateBs: bsDate,
  endDateBs: bsDate.optional().or(z.literal("")),
});

export type TeachingAssignmentCreateFormValues = z.infer<typeof teachingAssignmentCreateSchema>;

export const teachingAssignmentCreateDefaultValues: TeachingAssignmentCreateFormValues = {
  teacherId: "",
  batchTermSubjectId: "",
  assignedDateBs: "",
  endDateBs: "",
};
