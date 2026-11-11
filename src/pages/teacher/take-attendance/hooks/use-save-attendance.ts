import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import { apiErrorMessage } from "../attendance-utils";
import { saveAttendanceSheet, type T_ATTENDANCE_RECORD_INPUT } from "../service/service";

export type T_SaveAttendanceInput = {
  sessionId: string | null;
  assignmentId: string;
  teacherId: string;
  periodId: string;
  dateBs: string;
  records: T_ATTENDANCE_RECORD_INPUT[];
};

export function useSaveAttendance(onSaved: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: T_SaveAttendanceInput) => saveAttendanceSheet(input),
    onSuccess: () => {
      toast.success("Attendance saved");
      onSaved();
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_SHEET],
      });
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE] });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_SESSIONS],
      });
      void queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_HISTORY],
      });
    },
    onError: (error: unknown) => {
      toast.error(apiErrorMessage(error, "Failed to save attendance"));
    },
  });
}
