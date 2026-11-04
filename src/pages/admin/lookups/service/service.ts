import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_LOOKUP = {
  id: string;
  code: string;
  name: string;
  active?: boolean;
  type?: string;
};

export async function listLookups(params: { type: string; page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_LOOKUPS_URL}`, { params });
  return res.data as never;
}

export async function createLookup(input: { code: string; name: string; active?: boolean; type?: string }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_LOOKUPS_URL}`, input);
  return res.data as never;
}

export async function updateLookup(id: string, input: Partial<{ code: string; name: string; active: boolean }>): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_LOOKUPS_URL}/${id}`, input);
  return res.data as never;
}

export async function deleteLookup(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_LOOKUPS_URL}/${id}`);
  return res.data as never;
}
