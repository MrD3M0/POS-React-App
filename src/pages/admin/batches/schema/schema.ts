import { z } from "zod";

export const COURSE_CREATE_SCHEMA = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(1),
  system: z.enum(["SEMESTER", "YEARLY"]),
  totalTerms: z.number().int().min(1).max(24),
  description: z.string().optional(),
});

export const COURSE_UPDATE_SCHEMA = COURSE_CREATE_SCHEMA.partial();

export const BATCH_CREATE_SCHEMA = z.object({
  courseId: z.string().uuid(),
  name: z.string().min(2),
  startDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type T_COURSE = z.infer<typeof COURSE_CREATE_SCHEMA>;
export type T_COURSE_UPDATE = z.infer<typeof COURSE_UPDATE_SCHEMA>;

export const SUBJECT_CREATE_SCHEMA = z.object({
  code: z.string().min(2),
  name: z.string().min(1),
  description: z.string().optional(),
});
export type T_SUBJECT = z.infer<typeof SUBJECT_CREATE_SCHEMA>;
