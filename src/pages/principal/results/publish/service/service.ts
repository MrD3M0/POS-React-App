import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_APPROVED_RESULT = {
  id: string;
  examId?: string;
  studentId?: string;
  examName?: string;
  batchName?: string;
  studentName?: string;
  subjectName?: string;
  exam?: { id?: string; name?: string } | null;
  batch?: { id?: string; name?: string } | null;
  student?: { id?: string; firstName?: string; middleName?: string | null; lastName?: string } | null;
  subject?: { id?: string; name?: string } | null;
  status: "APPROVED" | "PUBLISHED";
  publishedAt?: string | null;
};

export async function listApprovedResults(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.RESULT_URL}`, {
    params: { ...params, status: "APPROVED" },
  });
  return res.data;
}

export async function publishResult(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.RESULT_URL}/${id}/transition`, { to: "PUBLISHED" });
  return res.data;
}
