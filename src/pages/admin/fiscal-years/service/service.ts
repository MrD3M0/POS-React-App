import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

const FY_URL = UrlConstants.FISCAL_YEAR_URL;

export type T_FY = {
  id: string;
  name: string;
  startDateBs: string;
  endDateBs: string;
  isCurrent?: boolean;
  isClosed?: boolean;
  createdAt?: string;
};

export async function listFiscalYears(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${FY_URL}`, { params });
  return res.data;
}

export async function getFiscalYearById(id: string): Promise<{ data: T_FY }> {
  const res = await axiosInstance.get(`${FY_URL}/${id}`);
  return res.data;
}

export async function createFiscalYear(input: {
  name: string;
  startDateBs: string;
  endDateBs: string;
  isCurrent?: boolean;
  isClosed?: boolean;
}): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${FY_URL}`, input);
  return res.data;
}

export async function updateFiscalYear(
  id: string,
  input: {
    name?: string;
    startDateBs?: string;
    endDateBs?: string;
    isCurrent?: boolean;
    isClosed?: boolean;
  },
): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${FY_URL}/${id}`, input);
  return res.data;
}

export async function deleteFiscalYear(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${FY_URL}/${id}`);
  return res.data;
}
