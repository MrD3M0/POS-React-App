import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_SETTING = {
  id?: string;
  key: string;
  value: string;
  description?: string | null;
};

export async function listSettings(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_SETTING_URL}`, { params });
  return res.data;
}

export async function getSettingById(id: string): Promise<{ data: T_SETTING }> {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_SETTING_URL}/${id}`);
  return res.data;
}

export async function createSetting(payload: Partial<T_SETTING>) {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_SETTING_URL}`, payload);
  return res.data;
}

export async function updateSetting(id: string, payload: Partial<T_SETTING>) {
  const res = await axiosInstance.patch(`${UrlConstants.ADMIN_SETTING_URL}/${id}`, payload);
  return res.data;
}

export async function deleteSetting(id: string) {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_SETTING_URL}/${id}`);
  return res.data;
}
