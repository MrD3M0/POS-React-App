import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_BillingStudent = {
  id: string;
  universityRegNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
};

export type T_FiscalYear = { id: string; name: string; isCurrent?: boolean };
export type T_PaymentMethod = { id: string; code: string; name: string };

export type T_StudentFeeItem = {
  id: string;
  studentFeeId: string;
  feeHeadId?: string;
  amount?: string | number;
  discountAmount?: string | number;
  netAmount?: string | number;
  isSkipped?: boolean;
  dueDateBs?: string | null;
  description?: string | null;
  feeHead?: { name?: string; code?: string } | null;
};

export type T_StudentFee = {
  id: string;
  studentId: string;
  feeStructureId?: string | null;
  student?: T_BillingStudent & { batchId?: string } | null;
  feeStructure?: { id?: string; name?: string; code?: string } | null;
  items?: T_StudentFeeItem[];
  createdAt?: string;
};

export type T_MethodLine = {
  paymentMethodId: string;
  amount: string;
  referenceNo?: string;
  bankName?: string;
  paymentMethod?: T_PaymentMethod | null;
};

export type T_Allocation = {
  studentFeeItemId: string;
  feeInstallmentId?: string;
  amount: string;
  studentFeeItem?: T_StudentFeeItem | null;
};

export type T_FeePayment = {
  id: string;
  receiptNo: string;
  studentId: string;
  fiscalYearId?: string;
  paymentDateBs: string;
  totalAmount: string | number;
  remarks?: string | null;
  isCancelled: boolean;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  student?: (T_BillingStudent & { batch?: { name?: string; course?: { name?: string; code?: string } } | null }) | null;
  fiscalYear?: T_FiscalYear | null;
  methodLines?: T_MethodLine[];
  allocations?: T_Allocation[];
  createdAt?: string;
};

export type T_Installment = {
  id: string;
  studentFeeItemId: string;
  installmentNo: number;
  dueDateBs: string;
  amount: string | number;
  studentFeeItem?: T_StudentFeeItem | null;
};

export function studentFullName(s?: { firstName?: string; middleName?: string | null; lastName?: string } | null) {
  if (!s) return "—";
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") || "—";
}

export function studentFeeNetTotal(fee?: T_StudentFee | null): number {
  if (!fee?.items?.length) return 0;
  return fee.items
    .filter((i) => !i.isSkipped)
    .reduce((acc, i) => acc + Number(i.netAmount ?? i.amount ?? 0), 0);
}

export function dueItemsCount(fee?: T_StudentFee | null): number {
  if (!fee?.items?.length) return 0;
  return fee.items.filter((i) => !i.isSkipped).length;
}

export async function listStudentFees(params: { page: number; limit: number; search?: string; studentId?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.STUDENT_FEE_URL}`, { params });
  return res.data;
}

export async function listStudents(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.STUDENT_URL}`, { params });
  return res.data;
}

export async function listFiscalYears(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.FISCAL_YEAR_URL}`, { params });
  return res.data;
}

export async function listPaymentMethods(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.PAYMENT_METHOD_URL}`, { params });
  return res.data;
}

export async function listStudentFeeItems(params: { page: number; limit: number; studentFeeId?: string; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.STUDENT_FEE_ITEM_URL}`, { params });
  return res.data;
}

export async function listFeePayments(params: { page: number; limit: number; search?: string; studentId?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.FEE_PAYMENT_URL}`, { params });
  return res.data;
}

export async function getFeePaymentById(id: string): Promise<{ data: T_FeePayment }> {
  const res = await axiosInstance.get(`${UrlConstants.FEE_PAYMENT_URL}/${id}`);
  return res.data;
}

export async function createFeePayment(input: {
  studentId: string;
  fiscalYearId: string;
  paymentDateBs: string;
  totalAmount: string;
  receiptNo?: string;
  remarks?: string;
  methodLines: { paymentMethodId: string; amount: string; referenceNo?: string; bankName?: string }[];
  allocations: { studentFeeItemId: string; amount: string }[];
}): Promise<{ message: string; data: T_FeePayment }> {
  const res = await axiosInstance.post(`${UrlConstants.FEE_PAYMENT_URL}`, input);
  return res.data;
}

export async function cancelFeePayment(id: string, reason: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.FEE_PAYMENT_URL}/${id}/cancel`, { reason });
  return res.data;
}

export async function listInstallments(params: {
  page: number;
  limit: number;
  studentFeeItemId?: string;
  search?: string;
}) {
  const res = await axiosInstance.get(`${UrlConstants.FEE_INSTALLMENT_URL}`, { params });
  return res.data;
}
