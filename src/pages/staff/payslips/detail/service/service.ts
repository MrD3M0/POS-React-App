import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_PAYSLIP = {
  id: string;
  payslipNo: string;
  payrollId: string;
  employeeId: string;
  presentDays: string | number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  basicSalary: string | number;
  attendanceDeduction?: string | number;
  totalAllowance?: string | number;
  teachingPay?: string | number;
  grossPay: string | number;
  totalDeduction: string | number;
  taxAmount: string | number;
  netPay: string | number;
  paidDateBs?: string | null;
  payroll?: { id?: string; yearBs?: number; monthBs?: number; status?: string } | null;
  employee?: { id?: string; firstName?: string; lastName?: string; employeeCode?: string } | null;
  items?: T_PAYSLIP_ITEM[] | null;
};

export type T_PAYSLIP_ITEM = {
  id: string;
  description: string;
  amount: string | number;
  isDeduction: boolean;
  isEmployerContribution: boolean;
  component?: { id?: string; name?: string } | null;
};

export async function getPayslipById(id: string): Promise<{ data: T_PAYSLIP }> {
  const res = await axiosInstance.get(`${UrlConstants.PAYSLIP_URL}/${id}`);
  return res.data;
}
