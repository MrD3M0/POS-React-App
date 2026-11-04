import { z } from "zod";

const RegisterSchema = z.object({
  username: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().trim().min(6),
});
export type T_RegisterSchema = z.infer<typeof RegisterSchema>;
