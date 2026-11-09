import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import { normalizeListBody } from "@/pages/accountant/service-utils";

export type T_FEE_PAYMENT_RECEIPT = {
  id: string;
  receiptNo: string;
  studentId?: string;
  paymentDateBs?: string;
  totalAmount?: string | number;
  remarks?: string | null;
  isCancelled?: boolean;
  cancelReason?: string | null;
  createdAt?: string;
  student?: {
    id?: string;
    universityRegNo?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
  } | null;
  fiscalYear?: { id?: string; name?: string } | null;
};

export async function listReceipts(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(UrlConstants.ACCOUNTANT_RECEIPTS_URL, { params });
  return normalizeListBody<T_FEE_PAYMENT_RECEIPT>(res.data);
}

export async function cancelReceipt(receiptId: string, reason: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_RECEIPTS_URL}/${receiptId}/cancel`, { reason });
  return res.data;
}
