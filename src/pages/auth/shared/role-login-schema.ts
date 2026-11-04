import { z } from "zod";

// Mirrors backend enum Role in schema.prisma: ADMIN | PRINCIPAL | ACCOUNTANT | TEACHER | STAFF
// STUDENT is preseeded, not a login surface.
export type Role = "ADMIN" | "PRINCIPAL" | "ACCOUNTANT" | "TEACHER" | "STAFF";

// Shared login shape — login page is always email + password; the role is chosen at login
// by which route the user came from, never validated per-field by Zod. Keeps frontend
// schemas one file from backend login validation.
export const roleLoginSchema = z.object({
  email: z.email({ message: "Email is required" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

export type TRoleLoginSchema = z.infer<typeof roleLoginSchema>;
