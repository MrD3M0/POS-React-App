import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_TERM = {
  id: string;
  termNumber: number;
  name: string;
  startDateBs?: string;
  endDateBs?: string;
  batchId?: string;
};

export async function listTerms(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_TERMS_URL}`, { params });
  return res.data as never;
}

export async function createTerm(input: { termNumber: number; name: string; startDateBs?: string; endDateBs?: string }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_TERMS_URL}`, input);
  return res.data as never;
}

export async function updateTerm(id: string, input: Partial<{ termNumber: number; name: string; startDateBs: string; endDateBs: string }>): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_TERMS_URL}/${id}`, input);
  return res.data as never;
}

export async function deleteTerm(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_TERMS_URL}/${id}`);
  return res.data as never;
}
