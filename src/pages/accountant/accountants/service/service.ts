import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type { T_AxiosResponseWithPagination, T_AxiosResponseWithoutPagination } from "@/types/common";
import type { T_AccountantSchema } from "../schema/schema";

/**
 * The backend Accountant table only stores `id` + `employeeId` (+ timestamps).
 * Every profile field comes from the linked Employee row, nested as `employee`
 * (see backend `AccountantService` / `EMPLOYEE_SAFE_SELECT`). Reading flat
 * `acc.firstName` etc. renders undefined — always go through `employee`.
 */
export type T_ACCOUNTANT_EMPLOYEE = {
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

export type T_ACCOUNTANT = {
  id: string;
  employeeId: string;
  employee?: T_ACCOUNTANT_EMPLOYEE | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type T_EMPLOYEE_OPTION = {
  id: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  designation?: string;
  phone?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHERS";
};

export async function listEmployeeOptions(params?: { page?: number; limit?: number; search?: string }) {
  const res = await axiosInstance.get(UrlConstants.ADMIN_EMPLOYEE_URL, {
    params: { page: params?.page ?? 1, limit: params?.limit ?? -1, search: params?.search ?? "" },
  });
  return res.data as { data?: { data?: T_EMPLOYEE_OPTION[] } };
}

export async function getAllAccountants(params: { page: number; search: string; limit: number }) {
  const response: T_AxiosResponseWithPagination<T_ACCOUNTANT> = await axiosInstance.get(
    `${UrlConstants.ACCOUNTANT_URL}`,
    { params },
  );
  return response.data;
}

export async function getAccountantById(id: string) {
  const response: T_AxiosResponseWithoutPagination<T_ACCOUNTANT> = await axiosInstance.get(
    `${UrlConstants.ACCOUNTANT_URL}/${id}`,
  );
  return response.data;
}

export async function createAccountant(data: T_AccountantSchema) {
  const response: T_AxiosResponseWithoutPagination<T_ACCOUNTANT> = await axiosInstance.post(
    `${UrlConstants.ACCOUNTANT_URL}`,
    data,
  );
  return response.data;
}

export async function removeAccountant(id: string) {
  const response: T_AxiosResponseWithoutPagination<unknown> = await axiosInstance.delete(
    `${UrlConstants.ACCOUNTANT_URL}/${id}`,
  );
  return response.data;
}
