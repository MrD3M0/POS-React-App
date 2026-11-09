import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_ATTENDANCE_SESSION = {
  id: string;
  teachingAssignmentId?: string;
  teacherId?: string;
  periodId?: string;
  dateBs?: string;
  isLocked?: boolean;
  locked?: boolean;
  teachingAssignment?: { id?: string } | null;
  teacher?: { id?: string; employeeId?: string } | null;
  period?: { id?: string; name?: string; periodNumber?: number } | null;
  [key: string]: unknown;
};

export type T_PERIOD = {
  id: string;
  name?: string;
  periodNumber?: number;
  startTime?: string;
  endTime?: string;
  [key: string]: unknown;
};

export async function listAttendanceSessions(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_ATTENDANCE_SESSIONS_URL}`, { params });
  return res.data;
}

export async function createAttendanceSession(input: Record<string, unknown>) {
  const res = await axiosInstance.post(`${UrlConstants.TEACHER_ATTENDANCE_SESSIONS_URL}`, input);
  return res.data;
}

export async function getAttendanceSessionById(id: string) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_ATTENDANCE_SESSIONS_URL}/${id}`);
  return res.data;
}

export async function updateAttendanceSession(id: string, input: Record<string, unknown>) {
  const res = await axiosInstance.patch(`${UrlConstants.TEACHER_ATTENDANCE_SESSIONS_URL}/${id}`, input);
  return res.data;
}

export async function deleteAttendanceSession(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.TEACHER_ATTENDANCE_SESSIONS_URL}/${id}`);
  return res.data;
}

export async function listPeriods(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.PERIOD_URL}`, { params });
  return res.data;
}
