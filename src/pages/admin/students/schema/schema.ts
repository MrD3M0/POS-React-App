import { z } from "zod";

export const STUDENT_APPROVAL_SCHEMA = z.object({
  status: z.enum(["ACTIVE", "GRADUATED", "DROPPED", "SUSPENDED"]),
  rejectReason: z.string().optional(),
});

export type T_STUDENT_APPROVAL = z.infer<typeof STUDENT_APPROVAL_SCHEMA>;
