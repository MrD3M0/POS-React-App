import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_HOLIDAY_TYPE = "PUBLIC" | "SCHOOL" | "WEEKLY";

export type T_HOLIDAY = {
  id: string;
  dateBs: string;
  name: string;
  type?: T_HOLIDAY_TYPE | string | null;
  description?: string | null;
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

/** Result payload of POST /holidays/bulk. */
export type T_HOLIDAY_BULK_RESULT = {
  requested: number;
  created: number;
  skipped: number;
  skippedDates: string[];
};

/**
 * Creates one holiday per date sharing the same name/type/description.
 * Dates that already exist are skipped by the backend, never fatal.
 */
export async function bulkCreateHolidays(payload: {
  name: string;
  type: T_HOLIDAY_TYPE;
  description?: string;
  dates: string[];
  appliesToEmployees: boolean;
  appliesToStudents: boolean;
}): Promise<{ data?: T_HOLIDAY_BULK_RESULT }> {
  const res = await axiosInstance.post(`${UrlConstants.HOLIDAY_URL}/bulk`, payload);
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
