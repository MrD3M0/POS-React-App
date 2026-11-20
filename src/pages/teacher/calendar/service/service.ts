import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

/** One expanded class occurrence returned by the class-schedule endpoints. */
export type T_CALENDAR_CLASS_EVENT = {
  id: string;
  dateBs: string;
  dayOfWeek: string;
  periodId: string;
  periodName: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  room: string | null;
  teachingAssignmentId: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  batchTermId: string;
  batchTermName: string;
  batchId: string;
  batchName: string;
  classLabel: string;
  isElective: boolean;
};

export type T_CLASS_CALENDAR_RESPONSE = {
  events: T_CALENDAR_CLASS_EVENT[];
  /** Employee holidays the backend skipped inside the range. */
  holidays: { dateBs: string; name: string }[];
};

/**
 * Weekly routine expanded to BS dates between `fromBs` and `toBs`.
 * TEACHER accounts are always scoped to their own schedule by the backend.
 */
export async function getClassScheduleCalendar(params: {
  fromBs: string;
  toBs: string;
  teacherId?: string;
}): Promise<T_CLASS_CALENDAR_RESPONSE> {
  const res = await axiosInstance.get(`${UrlConstants.CLASS_SCHEDULE_URL}/calendar`, {
    params,
  });
  return (
    (res.data as { data?: T_CLASS_CALENDAR_RESPONSE })?.data ?? {
      events: [],
      holidays: [],
    }
  );
}

/** Teacher's own routine for a date range (server enforces own-only). */
export async function getTeacherWeek(params: {
  teacherId: string;
  fromBs: string;
  toBs: string;
}): Promise<T_CALENDAR_CLASS_EVENT[]> {
  const { teacherId, ...rest } = params;
  const res = await axiosInstance.get(
    `${UrlConstants.CLASS_SCHEDULE_URL}/teacher/${teacherId}/week`,
    { params: rest },
  );
  return (res.data as { data?: T_CALENDAR_CLASS_EVENT[] })?.data ?? [];
}
