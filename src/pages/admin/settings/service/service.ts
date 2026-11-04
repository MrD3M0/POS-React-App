import axiosInstance from "@/lib/axios-request";
import { QUERY_KEYS } from "@/lib/query-keys";
import { UrlConstants } from "@/constants/endpoints";
import type { AxiosError, AxiosResponse } from "axios";

export type T_SETTING = {
  id?: string;
  key: string;
  value: string;
  description?: string | null;
};

export async function listSettings(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_SETTINGS_URL}`, { params });
  return res.data as never;
}

export async function createSetting(payload: Partial<T_SETTING>) {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_SETTINGS_URL}`, payload);
  return res.data as never;
}

export async function updateSetting(id: string, payload: Partial<T_SETTING>) {
  const res = await axiosInstance.patch(`${UrlConstants.ADMIN_SETTINGS_URL}/${id}`, payload);
  return res.data as never;
}

export async function deleteSetting(id: string) {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_SETTINGS_URL}/${id}`);
  return res.data as never;
}
