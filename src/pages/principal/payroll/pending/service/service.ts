import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_PENDING_PAYROLL = {
  id: string;
  employeeName: string;
  month: string;
  status: "PENDING" | "DRAFT" | "APPROVED" | "REJECTED" | "PAID";
  remarks?: string | null;
};

export async function listPendingPayrolls(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.PAYROLL_URL}`, {
    params: { ...params, status: "PENDING" },
  });
  return res.data;
}

export async function approvePayroll(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.PAYROLL_URL}/${id}/approve`);
  return res.data;
}

export async function rejectPayroll(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.PAYROLL_URL}/${id}/reject`);
  return res.data;
}
