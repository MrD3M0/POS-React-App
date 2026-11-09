import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_STUDENT_ATTENDANCE = {
  id: string;
  sessionId?: string;
  studentId?: string;
  status?: "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY" | string;
  remarks?: string | null;
  student?: {
    id?: string;
    universityRegNo?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
  } | null;
  session?: { id?: string; dateBs?: string } | null;
  [key: string]: unknown;
};

export type T_ATTENDANCE_SESSION = {
  id: string;
  dateBs?: string;
  isLocked?: boolean;
  period?: { id?: string; name?: string; periodNumber?: number } | null;
  teachingAssignment?: {
    id?: string;
    batchTermSubject?: {
      batchTerm?: { name?: string; batch?: { name?: string } | null } | null;
      subject?: { code?: string; name?: string } | null;
    } | null;
  } | null;
  [key: string]: unknown;
};

export async function listAttendanceSessions(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(UrlConstants.TEACHER_ATTENDANCE_SESSIONS_URL, { params });
  return res.data;
}

export async function listStudentAttendance(params: {
  page: number;
  limit: number;
  search?: string;
  sessionId?: string;
  studentId?: string;
  status?: string;
  dateBs?: string;
}) {
  const cleaned: Record<string, string | number | undefined> = {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    sessionId: params.sessionId || undefined,
    studentId: params.studentId || undefined,
    status: params.status || undefined,
    dateBs: params.dateBs || undefined,
  };
  const res = await axiosInstance.get(UrlConstants.TEACHER_ATTENDANCE_URL, { params: cleaned });
  return res.data;
}

export async function bulkMarkAttendance(input: {
  sessionId: string;
  records: Array<{ studentId: string; status: "PRESENT" | "ABSENT" | "LEAVE" | "HALF_DAY"; remarks?: string | null }>;
}) {
  const res = await axiosInstance.post(`${UrlConstants.TEACHER_ATTENDANCE_URL}/bulk`, input);
  return res.data;
}
