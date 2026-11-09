import { z } from "zod";

export const attendanceStatusSchema = z.enum(["PRESENT", "ABSENT", "LEAVE", "HALF_DAY"]);

export const takeAttendanceSchema = z.object({
  sessionId: z.string().uuid("Select an attendance session"),
});

export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;
export type TakeAttendanceFormValues = z.infer<typeof takeAttendanceSchema>;
