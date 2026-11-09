import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_PAYROLL_STATUS = "DRAFT" | "PENDING" | "APPROVED" | "PAID" | "REJECTED";

export type T_PAYROLL = {
  id: string;
  fiscalYearId?: string;
  yearBs?: number;
  monthBs?: number;
  totalDays?: number;
  status: T_PAYROLL_STATUS;
  paidDateBs?: string | null;
  remarks?: string | null;
  payslipsGenerated?: number;
  [key: string]: unknown;
};

/** Backend-aligned: POST /payroll creates a month payroll and auto-generates payslips. */
export async function generatePayroll(input: {
  fiscalYearId: string;
  yearBs: number;
  monthBs: number;
  remarks?: string | null;
}): Promise<T_PAYROLL> {
  const res = await axiosInstance.post(UrlConstants.PAYROLL_URL, input);
  return res.data?.data ?? res.data;
}

export async function submitPayroll(payrollId: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.PAYROLL_URL}/${payrollId}/submit`);
  return res.data;
}

/** Backend-aligned: POST /payroll/:id/pay with paidDateBs. */
export async function markPaid(payrollId: string, input: { paidDateBs: string }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.PAYROLL_URL}/${payrollId}/pay`, input);
  return res.data;
}

export async function listPayrolls(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  const res = await axiosInstance.get(UrlConstants.PAYROLL_URL, { params });
  return res.data;
}

export async function listFiscalYears(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(UrlConstants.FISCAL_YEAR_URL, { params });
  return res.data;
}
