import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type TDashboardRole =
  | "admin"
  | "principal"
  | "accountant"
  | "teacher"
  | "staff";

/** ONE aggregate request per role dashboard (`GET /dashboard/<role>`). */
export async function getRoleDashboard<T>(role: TDashboardRole): Promise<T> {
  const res = await axiosInstance.get(`${UrlConstants.DASHBOARD_URL}/${role}`);
  return res.data?.data as T;
}
