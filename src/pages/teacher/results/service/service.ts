import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_RESULT = {
  id: string;
  examName?: string;
  batchName?: string;
  studentName?: string;
  gpa?: number;
  status?: string;
  exam?: { id?: string; name?: string } | null;
  batch?: { id?: string; name?: string } | null;
  student?: { id?: string; firstName?: string; middleName?: string | null; lastName?: string } | null;
  [key: string]: unknown;
};

export async function listResults(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_RESULTS_URL}`, { params });
  return res.data;
}

export async function createResult(input: Record<string, unknown>) {
  const res = await axiosInstance.post(`${UrlConstants.TEACHER_RESULTS_URL}`, input);
  return res.data;
}

export async function updateResult(id: string, input: Record<string, unknown>) {
  const res = await axiosInstance.patch(`${UrlConstants.TEACHER_RESULTS_URL}/${id}`, input);
  return res.data;
}

export type T_RESULT_SUBJECT = {
  id: string;
  resultId?: string;
  examSubjectId?: string;
  marksObtained?: number | string;
  fullMarks?: number | string;
  creditHour?: number | string;
  gradePoint?: number | string;
  gradeScale?: { grade?: string; name?: string; gradePoint?: number | string } | null;
  examSubject?: { id?: string; fullMarks?: number | string; passMarks?: number | string } | null;
  [key: string]: unknown;
};

export type T_RESULT_DETAIL = T_RESULT & {
  totalMarks?: number | string;
  fullMarks?: number | string;
  percentage?: number | string;
  totalCreditHour?: number | string;
  cgpa?: number | string | null;
  isPassed?: boolean;
  subjects?: T_RESULT_SUBJECT[] | null;
  student?: {
    id?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    fullName?: string;
  } | null;
  exam?: { id?: string; name?: string } | null;
};

export async function getResultById(id: string) {
  const res = await axiosInstance.get(`${UrlConstants.RESULT_URL}/${id}`);
  return res.data;
}

export async function listResultSubjects(params: { page: number; limit: number; resultId?: string; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.RESULT_SUBJECT_URL}`, { params });
  return res.data;
}
