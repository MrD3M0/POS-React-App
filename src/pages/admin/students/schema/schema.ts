import { z } from "zod";

export const STUDENT_APPROVAL_SCHEMA = z.object({
  status: z.enum(["ACTIVE", "GRADUATED", "DROPPED", "SUSPENDED"]),
  rejectReason: z.string().optional(),
});

export type T_STUDENT_APPROVAL = z.infer<typeof STUDENT_APPROVAL_SCHEMA>;

const bsDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format");

const optionalBsDateSchema = bsDateSchema.optional().or(z.literal(""));

export const studentCreateSchema = z.object({
  universityRegNo: z.string().trim().min(1, "Registration number is required").max(50),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  middleName: z.string().optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHERS"], { message: "Please select a gender" }),
  dobBs: optionalBsDateSchema,
  phone: z.string().optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  permanentAddress: z.string().optional().or(z.literal("")),
  temporaryAddress: z.string().optional().or(z.literal("")),
  batchId: z.string().uuid("Please select a batch"),
  admissionDateBs: bsDateSchema,
  status: z.enum(["ACTIVE", "GRADUATED", "DROPPED", "SUSPENDED"]),
});

export type StudentCreateFormValues = z.infer<typeof studentCreateSchema>;

export const studentCreateDefaultValues: StudentCreateFormValues = {
  universityRegNo: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "MALE",
  dobBs: "",
  phone: "",
  email: "",
  permanentAddress: "",
  temporaryAddress: "",
  batchId: "",
  admissionDateBs: "",
  status: "ACTIVE",
};

export const studentEditSchema = studentCreateSchema.extend({
  approvalStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional().or(z.literal("")),
});

export type StudentEditFormValues = z.infer<typeof studentEditSchema>;

export const studentEditDefaultValues: StudentEditFormValues = {
  ...studentCreateDefaultValues,
  approvalStatus: "PENDING",
  rejectionReason: "",
};
