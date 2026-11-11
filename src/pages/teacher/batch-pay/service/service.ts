import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_TEACHER_BATCH_PAY = {
  id: string;
  teachingAssignmentId?: string;
  ratePerCreditHour?: number | string | null;
  fixedMonthlyAmount?: number | string | null;
  effectiveFromBs?: string;
  effectiveToBs?: string | null;
  teachingAssignment?: {
    id?: string;
    teacher?: {
      employee?: {
        firstName?: string | null;
        middleName?: string | null;
        lastName?: string | null;
        employeeCode?: string | null;
      } | null;
    } | null;
    batchTermSubject?: {
      subject?: { code?: string; name?: string } | null;
      batchTerm?: {
        name?: string | null;
        termNumber?: number | null;
        batch?: { name?: string } | null;
      } | null;
    } | null;
  } | null;
  [key: string]: unknown;
};

export async function listBatchPays(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_BATCH_PAY_URL}`, {
    params,
  });
  return res.data;
}

export async function createBatchPay(input: Record<string, unknown>) {
  const res = await axiosInstance.post(
    `${UrlConstants.TEACHER_BATCH_PAY_URL}`,
    input,
  );
  return res.data;
}

export async function getBatchPayById(id: string) {
  const res = await axiosInstance.get(
    `${UrlConstants.TEACHER_BATCH_PAY_URL}/${id}`,
  );
  return res.data;
}

export async function updateBatchPay(
  id: string,
  input: Record<string, unknown>,
) {
  const res = await axiosInstance.patch(
    `${UrlConstants.TEACHER_BATCH_PAY_URL}/${id}`,
    input,
  );
  return res.data;
}
