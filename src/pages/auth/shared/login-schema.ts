import { z } from "zod";

// Single login surface for every role. Role is resolved by the backend from
// the account, so the form only ever collects email + password.
export const loginSchema = z.object({
  // Mirror the backend: normalize before validating, so lookup is case-insensitive
  email: z.string().trim().toLowerCase().pipe(z.email({ message: "Email is required" })),
  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

export type TLoginSchema = z.infer<typeof loginSchema>;
