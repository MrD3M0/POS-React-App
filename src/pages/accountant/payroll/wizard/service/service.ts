import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_PAYROLL_STATUS = "DRAFT" | "PENDING" | "APPROVED" | "PAID" | "REJECTED";

export type T_PAYROLL_ITEM = {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  daysAttended: number;
  leaveDays: number;
  allowances: number;
  teachingPay: number;
  ssfDeduction: number;
  pfDeduction: number;
  citDeduction: number;
  taxDeduction: number;
  netPay: number;
};

export type T_PAYROLL = {
  id: string;
  month: string;
  status: T_PAYROLL_STATUS;
  items: T_PAYROLL_ITEM[];
};

export async function generatePayroll(input: { month: string; employeeId: string; daysAttended: number; leaveDays: number; allowances: number; teachingPay: number; ssfDeduction?: number; pfDeduction?: number; citDeduction?: number; taxDeduction?: number }): Promise<{ message: string; payrollId: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_PAYROLL_WIZARD_URL}/generate`, input);
  return res.data as never;
}

export async function submitPayroll(payrollId: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_PAYROLL_WIZARD_URL}/${payrollId}/submit`);
  return res.data as never;
}

export async function approvePayroll(payrollId: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.PRINCIPAL_PAYROLL_PENDING_URL}`);
  return res.data as never;
}

export async function markPaid(payrollId: string, input: { paymentMethod: string; paidDate?: string }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_PAYROLL_WIZARD_URL}/${payrollId}/mark-paid`, input);
  return res.data as never;
}
