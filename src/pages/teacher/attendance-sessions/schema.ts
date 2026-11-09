import { z } from "zod";

export const attendanceSessionSchema = z.object({
  teachingAssignmentId: z.string().min(1, "Teaching assignment is required"),
  periodId: z.string().min(1, "Period is required"),
  dateBs: z.string().min(1, "Date & time (BS) is required"),
  isLocked: z.boolean(),
});

export type AttendanceSessionValues = z.infer<typeof attendanceSessionSchema>;
