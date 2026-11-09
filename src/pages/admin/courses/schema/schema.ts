import { z } from "zod";

export const courseSchema = z.object({
  code: z.string().trim().min(1, "Course code is required").max(50, "Course code is too long"),
  name: z.string().trim().min(1, "Course name is required").max(255, "Course name is too long"),
  system: z.enum(["SEMESTER", "YEARLY"], { message: "Please select a system" }),
  totalTerms: z.number().int().min(1, "Total terms must be at least 1").max(20, "Total terms is too high"),
  description: z.string().max(2000, "Description is too long").optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

export const courseDefaultValues: CourseFormValues = {
  code: "",
  name: "",
  system: "SEMESTER",
  totalTerms: 8,
  description: "",
  isActive: true,
};
