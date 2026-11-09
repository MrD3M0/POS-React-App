import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_PENDING_RESULT = {
  id: string;
  examName?: string;
  batchName?: string;
  studentName?: string;
  subjectName?: string;
  exam?: { id?: string; name?: string } | null;
  batch?: { id?: string; name?: string } | null;
  student?: { id?: string; firstName?: string; middleName?: string | null; lastName?: string } | null;
  subject?: { id?: string; name?: string } | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export async function listPendingResults(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.RESULT_URL}`, {
    params: { ...params, status: "PENDING" },
  });
  return res.data;
}

export async function approveResult(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.RESULT_URL}/${id}/transition`, { to: "APPROVED" });
  return res.data;
}

export async function rejectResult(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.RESULT_URL}/${id}/transition`, { to: "REJECTED" });
  return res.data;
}
