import { z } from "zod";

export const createTeacherStudentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  universityRegNo: z.string().trim().min(1, "University registration number is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHERS"]),
  dobBs: z.string().optional(),
  admissionDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Admission date (BS) is required"),
  batchId: z.string().min(1, "Batch is required"),
  phone: z.string().optional(),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  permanentAddress: z.string().optional(),
  temporaryAddress: z.string().optional(),
  guardianRelation: z.enum(["FATHER", "MOTHER", "GUARDIAN", "OTHER"]),
  guardianName: z.string().trim().min(1, "Guardian name is required"),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  guardianOccupation: z.string().optional(),
  guardianAddress: z.string().optional(),
});

export type CreateTeacherStudentValues = z.infer<typeof createTeacherStudentSchema>;
