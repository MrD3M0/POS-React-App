import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_EXAM = {
  id: string;
  name?: string;
  examName?: string;
  batchTermId?: string;
  examTypeId?: string;
  startDateBs?: string | null;
  endDateBs?: string | null;
  termNumber?: number;
  subjectCode?: string;
  batchTerm?: { id?: string; name?: string; termNumber?: number; batchId?: string; batch?: { id?: string; name?: string } | null } | null;
  examType?: { id?: string; name?: string } | null;
  subjects?: unknown[];
  createdAt?: string;
  [key: string]: unknown;
};

export type T_EXAM_TYPE = {
  id: string;
  name: string;
};

export async function listExamTypes(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.EXAM_TYPE_URL}`, { params });
  return res.data;
}

export async function listExams(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_EXAMS_URL}`, { params });
  return res.data;
}

export async function createExam(input: Record<string, unknown>) {
  const res = await axiosInstance.post(`${UrlConstants.TEACHER_EXAMS_URL}`, input);
  return res.data;
}

export async function getExamById(id: string) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_EXAMS_URL}/${id}`);
  return res.data;
}

export async function updateExam(id: string, input: Record<string, unknown>) {
  const res = await axiosInstance.patch(`${UrlConstants.TEACHER_EXAMS_URL}/${id}`, input);
  return res.data;
}
