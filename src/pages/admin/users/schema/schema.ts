import { z } from "zod";

export const EMPLOYEE_CREATE_SCHEMA = z.object({
  employeeCode: z.string().min(2),
  firstName: z.string().min(1, "First name required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name required"),
  gender: z.enum(["MALE", "FEMALE", "OTHERS"]),
  dobBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  permanentAddress: z.string().optional(),
  temporaryAddress: z.string().optional(),
  designation: z.string().min(1, "Designation required"),
  joinDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  panNo: z.string().optional(),
  ssfNo: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
});

export const EMPLOYEE_UPDATE_SCHEMA = EMPLOYEE_CREATE_SCHEMA.partial();

export type T_EMPLOYEE_CREATE = z.infer<typeof EMPLOYEE_CREATE_SCHEMA>;
export type T_EMPLOYEE_UPDATE = z.infer<typeof EMPLOYEE_UPDATE_SCHEMA>;
