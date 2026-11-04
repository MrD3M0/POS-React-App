import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_SUBJECT = {
  id: string;
  code: string;
  name: string;
  creditHours?: number;
  termId?: string;
  batchId?: string;
};

export async function listSubjects(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_SUBJECT_URL}`, { params });
  return res.data as never;
}

export async function createSubject(input: { code: string; name: string; creditHours?: number }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_SUBJECT_URL}`, input);
  return res.data as never;
}

export async function updateSubject(id: string, input: Partial<{ code: string; name: string; creditHours: number }>): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_SUBJECT_URL}/${id}`, input);
  return res.data as never;
}

export async function deleteSubject(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_SUBJECT_URL}/${id}`);
  return res.data as never;
}
