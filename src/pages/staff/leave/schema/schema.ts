import { z } from "zod";

export const staffLeaveSchema = z.object({
  dateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a date (YYYY-MM-DD, BS)"),
  leaveTypeId: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal("")),
});

export type StaffLeaveFormValues = z.infer<typeof staffLeaveSchema>;

export const staffLeaveDefaultValues: StaffLeaveFormValues = {
  dateBs: "",
  leaveTypeId: "",
  remarks: "",
};
