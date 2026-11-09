import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_SUBJECT = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type T_ListResponse = {
  data: { data: T_SUBJECT[]; pagination: { page: number; limit: number; total: number } };
};

export async function listSubjects(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get<T_ListResponse>(`${UrlConstants.ADMIN_SUBJECT_URL}`, { params });
  return res.data;
}

export async function getSubjectById(id: string): Promise<{ data: T_SUBJECT }> {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_SUBJECT_URL}/${id}`);
  return res.data;
}

export async function createSubject(input: {
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_SUBJECT_URL}`, input);
  return res.data;
}

export async function updateSubject(
  id: string,
  input: Partial<{ code: string; name: string; description?: string | null; isActive: boolean }>,
): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.ADMIN_SUBJECT_URL}/${id}`, input);
  return res.data;
}

export async function deleteSubject(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_SUBJECT_URL}/${id}`);
  return res.data;
}
