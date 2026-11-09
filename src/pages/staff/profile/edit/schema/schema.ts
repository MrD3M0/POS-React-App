import { z } from "zod";

export const staffProfileEditSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
});

export type StaffProfileEditFormValues = z.infer<typeof staffProfileEditSchema>;

export const staffProfileEditDefaultValues: StaffProfileEditFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  department: "",
};
