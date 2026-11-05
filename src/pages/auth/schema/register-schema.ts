import { z } from "zod";

export const REGISTER_SCHEMA = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username cannot be empty")
    .max(32, "Username too long"),
  email: z
    .string()
    .trim()
    .email("Email is required")
    .max(255, "Email too long"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password too long"),
  confirmPassword: z.string().min(6, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export type T_RegisterFormValues = z.infer<typeof REGISTER_SCHEMA>;
