import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import { normalizeListBody, type T_ListBody } from "@/pages/accountant/service-utils";
import type { CreateFeePaymentFormValues } from "../schema/schema";

export type T_PAYMENT = {
  id: string;
  receiptNo?: string;
  studentId?: string;
  studentName?: string;
  courseName?: string;
  totalAmount?: number | string;
  amountDue?: number;
  paymentDateBs?: string;
  paidDate?: string;
  status?: "OUTSTANDING" | "PARTIAL" | "PAID" | "CANCELLED";
  isCancelled?: boolean;
  methodLines?: Array<{ paymentMethodId?: string; methodId?: string; methodCode?: string; amount: number | string; referenceNo?: string | null }>;
  student?: { id?: string; firstName?: string; middleName?: string | null; lastName?: string; universityRegNo?: string };
};

export type T_STUDENT_FEE_ITEM = {
  id: string;
  netAmount?: number | string;
  amount?: number | string;
  discountAmount?: number | string;
  isSkipped?: boolean;
  termNumber?: number | null;
  feeHead?: { code?: string; name?: string };
  feeHeadId?: string;
};

export type T_STUDENT_FEE = {
  id: string;
  studentId: string;
  feeStructureId?: string;
  feeStructure?: { courseName?: string; termLabel?: string };
  items?: T_STUDENT_FEE_ITEM[];
};

export async function listPayments(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(UrlConstants.ACCOUNTANT_PAYMENTS_URL, { params });
  return normalizeListBody(res.data as T_ListBody<T_PAYMENT>);
}

export async function listStudentFeesByStudent(studentId: string) {
  const res = await axiosInstance.get(UrlConstants.STUDENT_FEE_URL, {
    params: { studentId, page: 1, limit: -1 },
  });
  return normalizeListBody(res.data as T_ListBody<T_STUDENT_FEE>);
}

export async function createFeePayment(input: CreateFeePaymentFormValues): Promise<{ message: string; data?: unknown }> {
  const methodTotal = input.methodLines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const payload = {
    studentId: input.studentId,
    fiscalYearId: input.fiscalYearId?.trim() || undefined,
    paymentDateBs: input.paymentDateBs,
    totalAmount: methodTotal,
    remarks: input.remarks?.trim() || undefined,
    methodLines: input.methodLines.map((l) => ({
      paymentMethodId: l.paymentMethodId,
      amount: Number(l.amount),
      referenceNo: l.referenceNo?.trim() || undefined,
      bankName: l.bankName?.trim() || undefined,
    })),
    allocations: input.allocations.map((a) => ({
      studentFeeItemId: a.studentFeeItemId,
      feeInstallmentId: a.feeInstallmentId?.trim() || undefined,
      amount: Number(a.amount),
    })),
  };
  const res = await axiosInstance.post(UrlConstants.ACCOUNTANT_PAYMENTS_URL, payload);
  return res.data;
}

export async function cancelReceipt(receiptId: string, reason: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_PAYMENTS_URL}/${receiptId}/cancel`, { reason });
  return res.data;
}
