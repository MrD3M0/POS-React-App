import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type { T_AxiosResponseWithPagination } from "@/types/common";

/**
 * The backend Staff table only stores `id` + `employeeId` (+ timestamps).
 * Every profile field comes from the linked Employee row, nested as `employee`
 * (see backend `StaffService` / `EMPLOYEE_SAFE_SELECT`). Reading flat
 * `s.firstName` etc. renders undefined — always go through `employee`.
 */
export type T_STAFF_EMPLOYEE = {
  id: string;
  employeeCode?: string;
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHERS";
  designation?: string | null;
  isActive?: boolean;
  photoUrl?: string | null;
};

export type T_STAFF_PROFILE = {
  id: string;
  employeeId: string;
  employee?: T_STAFF_EMPLOYEE | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function getAllStaff(params: { page: number; search: string; limit: number }) {
  const response: T_AxiosResponseWithPagination<T_STAFF_PROFILE> = await axiosInstance.get(
    `${UrlConstants.STAFF_URL}`,
    { params },
  );
  return response.data;
}
