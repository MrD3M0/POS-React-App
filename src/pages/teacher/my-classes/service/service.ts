import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_MY_CLASS = {
  id: string;
  batchName?: string;
  subjectCode?: string;
  subjectName?: string;
  className?: string;
  studentCount?: number;
  batch?: { id?: string; name?: string } | null;
  batchTermSubject?: {
    id?: string;
    subject?: { code?: string; name?: string } | null;
    batchTerm?: { termNumber?: number; name?: string; batch?: { name?: string } } | null;
  } | null;
  subject?: { code?: string; name?: string } | null;
  [key: string]: unknown;
};

export async function listMyClasses(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_MY_CLASSES_URL}`, { params });
  return res.data;
}
