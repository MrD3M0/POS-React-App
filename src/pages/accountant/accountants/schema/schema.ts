import { z } from "zod";

export const AccountantSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  designation: z.string().min(1, "Designation is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHERS"]),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

export type T_AccountantSchema = z.infer<typeof AccountantSchema>;

export const AccountantDefaultValues: T_AccountantSchema = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  designation: "",
  gender: "MALE",
  phone: "",
  isActive: true,
};
