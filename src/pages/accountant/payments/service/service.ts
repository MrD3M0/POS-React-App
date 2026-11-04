import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_PAYMENT = {
  id: string;
  studentName: string;
  courseName: string;
  amountDue: number;
  status: "OUTSTANDING" | "PARTIAL" | "PAID" | "CANCELLED";
  receiptNo?: string;
  paidDate?: string;
  methodLines?: { methodId: string; methodCode: string; amount: number; referenceNo?: string }[];
};

export async function listPayments(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ACCOUNTANT_PAYMENTS_URL}`, { params });
  return res.data as never;
}

// Add a payment with split methods
export async function addPayment(input: { studentId: string; courseName: string; totalAmount: number; methodLines: { methodId: string; methodCode: string; amount: number; referenceNo?: string }[] }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_PAYMENTS_URL}`, input);
  return res.data as never;
}

// Cancel a receipt with a reason (creates reversal entry, never edited or deleted)
export async function cancelReceipt(receiptId: string, reason: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_RECEIPTS_URL}/${receiptId}/cancel`, { reason });
  return res.data as never;
}
