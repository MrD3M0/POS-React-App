import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_STAFF_UPDATE = {
  firstName: string;
  lastName: string;
  phone?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  department?: string;
};

/** Employee block of `GET /staff/me` (loose: the endpoint returns a wide row). */
export type T_STAFF_EMPLOYEE = {
  id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  designation?: string;
  department?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  isActive?: boolean;
  [key: string]: unknown;
};

/** Response row of `GET /staff/me`. Coerce fields at the call site. */
export type T_STAFF_RECORD = {
  id?: string;
  employeeId?: string;
  employee?: T_STAFF_EMPLOYEE | null;
  [key: string]: unknown;
};

export async function getOwnStaff(): Promise<{ data: T_STAFF_RECORD }> {
  const res = await axiosInstance.get(`${UrlConstants.STAFF_URL}/me`);
  return res.data;
}

export async function updateStaff(id: string, input: T_STAFF_UPDATE): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.STAFF_URL}/${id}`, input);
  return res.data;
}
