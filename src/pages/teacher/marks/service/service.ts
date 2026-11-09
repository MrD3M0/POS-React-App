import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_MARK = {
  id: string;
  examId?: string;
  examSubjectId?: string;
  studentId?: string;
  subjectId?: string;
  marks?: number | string;
  obtainedMarks?: number | string;
  fullMarks?: number | string;
  isAbsent?: boolean;
  studentName?: string;
  student?: { id?: string; firstName?: string; middleName?: string | null; lastName?: string } | null;
  subject?: { id?: string; code?: string; name?: string } | null;
  [key: string]: unknown;
};

export async function listMarks(params: { page: number; limit: number; search?: string; examId?: string; examSubjectId?: string; studentId?: string }) {
  const cleaned: Record<string, string | number | undefined> = {
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    examId: params.examId || undefined,
    examSubjectId: params.examSubjectId || undefined,
    studentId: params.studentId || undefined,
  };
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_MARKS_URL}`, { params: cleaned });
  return res.data;
}

export async function createMark(input: Record<string, unknown>) {
  const res = await axiosInstance.post(`${UrlConstants.TEACHER_MARKS_URL}`, input);
  return res.data;
}

export async function updateMark(id: string, input: Record<string, unknown>) {
  const res = await axiosInstance.patch(`${UrlConstants.TEACHER_MARKS_URL}/${id}`, input);
  return res.data;
}

export async function bulkMarks(data: Record<string, unknown>) {
  const res = await axiosInstance.post(`${UrlConstants.TEACHER_MARKS_URL}/bulk`, data);
  return res.data;
}
