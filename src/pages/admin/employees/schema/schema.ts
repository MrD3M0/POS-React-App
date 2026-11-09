import { z } from "zod";

export const employeeEditSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHERS"], { message: "Gender is required" }),
  designation: z.string().trim().min(1, "Designation is required"),
  dobBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD (BS)").optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  permanentAddress: z.string().optional().or(z.literal("")),
  temporaryAddress: z.string().optional().or(z.literal("")),
  joinDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD (BS)").optional().or(z.literal("")),
  panNo: z.string().optional().or(z.literal("")),
  ssfNo: z.string().optional().or(z.literal("")),
  bankName: z.string().optional().or(z.literal("")),
  bankAccountNo: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type EmployeeEditFormValues = z.infer<typeof employeeEditSchema>;

export const employeeEditDefaultValues: EmployeeEditFormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "MALE",
  designation: "",
  dobBs: "",
  email: "",
  phone: "",
  permanentAddress: "",
  temporaryAddress: "",
  joinDateBs: "",
  panNo: "",
  ssfNo: "",
  bankName: "",
  bankAccountNo: "",
  isActive: true,
};
