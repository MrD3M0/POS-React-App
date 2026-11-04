import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_BATCH = {
  id: string;
  name: string;
  currentTermNumber: number;
  isActive: boolean;
  createdAt?: string;
};

export type T_TERM = {
  id: string;
  termNumber: number;
  name: string;
  startDateBs?: string;
  endDateBs?: string;
  batchId?: string;
};

export async function listBatches(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_BATCH_URL}`, { params });
  return res.data as never;
}

export async function createBatch(input: { name: string; currentTermNumber: number; isActive?: boolean }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_BATCH_URL}`, input);
  return res.data as never;
}

export async function updateBatch(id: string, input: Partial<{ name: string; currentTermNumber: number; isActive: boolean }>): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_BATCH_URL}/${id}`, input);
  return res.data as never;
}

export async function deleteBatch(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_BATCH_URL}/${id}`);
  return res.data as never;
}

export async function moveBatchToNextTerm(batchId: string, nextTermNumber: number): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_BATCH_URL}/${batchId}/next`, { nextTermNumber });
  return res.data as never;
}

export async function listTerms(batchId?: string) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_TERMS_URL}`, { params: { batchId } });
  return res.data as never;
}
