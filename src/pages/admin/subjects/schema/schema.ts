import { z } from "zod";

export const subjectCreateSchema = z.object({
  code: z.string().trim().min(1, "Subject code is required").max(20, "Code cannot exceed 20 characters"),
  name: z.string().trim().min(1, "Subject name is required").max(255),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type SubjectCreateFormValues = z.infer<typeof subjectCreateSchema>;

export const subjectCreateDefaultValues: SubjectCreateFormValues = {
  code: "",
  name: "",
  description: "",
  isActive: true,
};
