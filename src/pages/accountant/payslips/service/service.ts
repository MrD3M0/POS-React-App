import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import { normalizeListBody } from "@/pages/accountant/service-utils";

export type T_PAYSLIP_EMPLOYEE = {
  id: string;
  employeeCode: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  designation: string;
};

export type T_PAYSLIP_PAYROLL = {
  id: string;
  yearBs: number;
  monthBs: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  paidDateBs?: string | null;
};

export type T_PAYSLIP = {
  id: string;
  payslipNo: string;
  payrollId: string;
  employeeId: string;
  grossPay: string | number;
  netPay: string | number;
  paidDateBs?: string | null;
  employee?: T_PAYSLIP_EMPLOYEE;
  payroll?: T_PAYSLIP_PAYROLL;
};

export async function listPayslips(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const res = await axiosInstance.get(UrlConstants.ACCOUNTANT_PAYSLIPS_URL, {
    params,
  });
  return normalizeListBody<T_PAYSLIP>(res.data);
}

export async function getPayslipById(id: string) {
  const res = await axiosInstance.get(
    `${UrlConstants.ACCOUNTANT_PAYSLIPS_URL}/${id}`,
  );
  return res.data;
}
