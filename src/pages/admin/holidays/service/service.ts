import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_HOLIDAY = {
  id: string;
  dateBs: string;
  name: string;
  appliesToEmployees: boolean;
  appliesToStudents: boolean;
  deletedAt?: string | null;
};

export async function listHolidays(params: { page: number; limit: number; search?: string; yearBs?: number; monthBs?: number }) {
  const res = await axiosInstance.get(UrlConstants.HOLIDAY_URL, { params });
  return res.data;
}

export async function createHoliday(payload: Partial<T_HOLIDAY>) {
  const res = await axiosInstance.post(UrlConstants.HOLIDAY_URL, payload);
  return res.data;
}

export async function updateHoliday(id: string, payload: Partial<T_HOLIDAY>) {
  const res = await axiosInstance.patch(`${UrlConstants.HOLIDAY_URL}/${id}`, payload);
  return res.data;
}

export async function deleteHoliday(id: string) {
  const res = await axiosInstance.delete(`${UrlConstants.HOLIDAY_URL}/${id}`);
  return res.data;
}

export async function generateWeeklyOffs(yearBs: number, name = "Saturday") {
  const res = await axiosInstance.post(`${UrlConstants.HOLIDAY_URL}/weekly-offs`, { yearBs, name });
  return res.data;
}
