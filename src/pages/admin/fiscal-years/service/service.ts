import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_FY_STATUS = "OPEN" | "CLOSED";
const FY_URL = UrlConstants.ADMIN_FISCALYEAR_URL;

export type T_FY = {
  id: string;
  year: string;
  startDateBs?: string;
  endDateBs?: string;
  status: T_FY_STATUS;
  createdAt?: string;
};

export async function listFiscalYears(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${FY_URL}`, { params });
  return res.data as never;
}

export async function createFiscalYear(input: { year: string; startDateBs?: string; endDateBs?: string }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${FY_URL}`, input);
  return res.data as never;
}

export async function updateFiscalYear(id: string, input: Partial<{ year: string; startDateBs: string; endDateBs: string }>): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${FY_URL}/${id}`, input);
  return res.data as never;
}

export async function deleteFiscalYear(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${FY_URL}/${id}`);
  return res.data as never;
}

// Helper: closed fiscal years block payments/journal entries at the API.
export async function isClosed(params: { fiscalYearId: string }): Promise<boolean> {
  try {
    const res = await axiosInstance.get(`${FY_URL}/${params.fiscalYearId}/closed`);
    return (res.data as { closed: boolean }).closed;
  } catch {
    return false;
  }
}
