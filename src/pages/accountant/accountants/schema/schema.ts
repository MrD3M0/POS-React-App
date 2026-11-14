import { z } from "zod";

/**
 * Matches the backend contract exactly (`src/modules/accountant/validator.ts`):
 * creating an Accountant only LINKS an existing employee record. All profile
 * fields (name, email, designation, gender, phone) live on the Employee row
 * and are edited via /admin/employees — they are NOT part of this payload.
 */
export const AccountantSchema = z.object({
  employeeId: z.string().uuid("Select an employee to link as accountant"),
});

export type T_AccountantSchema = z.infer<typeof AccountantSchema>;

export const AccountantDefaultValues: T_AccountantSchema = {
  employeeId: "",
};
