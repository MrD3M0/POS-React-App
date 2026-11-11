import { useQuery } from "@tanstack/react-query";
import { isBsDateString } from "@/lib/bs-date";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getStudentHoliday,
  listActivePeriods,
  listTeachingAssignments,
  loadAttendanceSheet,
  type T_ATTENDANCE_SHEET_DATA,
  type T_PERIOD,
  type T_ROSTER_ENTRY,
} from "../service/service";

export type T_AttendanceSelection = {
  assignmentId: string;
  periodId: string;
  dateBs: string;
};

const EMPTY_ROWS: T_ROSTER_ENTRY[] = [];
const EMPTY_PERIODS: T_PERIOD[] = [];

export function useAttendanceData(selection: T_AttendanceSelection) {
  const assignmentsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_ASSIGNMENTS, "active"],
    queryFn: listTeachingAssignments,
    staleTime: 5 * 60_000,
  });

  const periodsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LOOKUP_PERIOD, "active"],
    queryFn: listActivePeriods,
    staleTime: 5 * 60_000,
  });

  const holidayQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_ATTENDANCE_SHEET, "holiday", selection.dateBs],
    queryFn: () => getStudentHoliday(selection.dateBs),
    enabled: isBsDateString(selection.dateBs),
    retry: false,
    staleTime: 5 * 60_000,
  });

  const assignments = (assignmentsQuery.data ?? []).filter(
    (assignment) => assignment.isActive !== false,
  );
  const assignment =
    assignments.find((item) => item.id === selection.assignmentId) ?? null;

  const sheetQuery = useQuery({
    queryKey: [
      QUERY_KEYS.TEACHER_ATTENDANCE_SHEET,
      selection.assignmentId,
      selection.periodId,
      selection.dateBs,
    ],
    queryFn: () => {
      if (!assignment) throw new Error("Select a class before loading attendance");
      return loadAttendanceSheet({
        assignment,
        periodId: selection.periodId,
        dateBs: selection.dateBs,
      });
    },
    enabled: Boolean(assignment && selection.periodId && isBsDateString(selection.dateBs)),
    // Never reset an in-progress draft because of a background refetch.
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const sheet: T_ATTENDANCE_SHEET_DATA | undefined = sheetQuery.data;
  const hasSelection = Boolean(
    assignment && selection.periodId && isBsDateString(selection.dateBs),
  );

  return {
    assignments,
    periods: periodsQuery.data ?? EMPTY_PERIODS,
    assignment,
    sheet,
    rows: sheet?.rows ?? EMPTY_ROWS,
    session: sheet?.session ?? null,
    holiday: holidayQuery.data ?? null,
    isLocked: sheet?.session?.isLocked === true,
    hasSelection,
    isLoading:
      assignmentsQuery.isLoading || periodsQuery.isLoading || sheetQuery.isLoading,
    isError:
      assignmentsQuery.isError || periodsQuery.isError || sheetQuery.isError,
    error: assignmentsQuery.error ?? periodsQuery.error ?? sheetQuery.error ?? null,
    refetch: () => {
      void assignmentsQuery.refetch();
      void periodsQuery.refetch();
      void sheetQuery.refetch();
    },
  };
}

export type T_AttendanceData = ReturnType<typeof useAttendanceData>;
