import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_FEE_HEAD = {
  id: string;
  code: string;
  name: string;
};

export type T_FEE_STRUCTURE = {
  id: string;
  courseName: string;
  batchId?: string;
  termLabel: string;
  feeHeadCode: string;
  amount: number;
  isCollected: boolean;
  hasCustom: boolean;
};

export async function listFeeStructures(params: { page: number; limit: number }) {
  const res = await axiosInstance.get(`${UrlConstants.ACCOUNTANT_FEES_STRUCTURE_URL}`, { params });
  return res.data as never;
}

export async function createFeeStructure(input: { courseName: string; batchId?: string; termLabel: string; feeHeadCode: string; amount: number }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_FEES_STRUCTURE_URL}`, input);
  return res.data as never;
}
