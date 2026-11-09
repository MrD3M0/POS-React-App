import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type { T_AxiosResponseWithPagination, T_AxiosResponseWithoutPagination } from "@/types/common";
import type { T_AccountantSchema } from "../schema/schema";

export type T_ACCOUNTANT = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName?: string | null;
  middleName?: string | null;
  email: string;
  passwordHash?: string | null;
  designation: string;
  phone?: string | null;
  gender: "MALE" | "FEMALE" | "OTHERS";
  ssfNo?: string | null;
  bankAccountNo?: string | null;
  panNo?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  employee?: unknown;
};

export type T_EMPLOYEE_OPTION = {
  id: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  designation?: string;
};

export async function listEmployeeOptions(params?: { page?: number; limit?: number; search?: string }) {
  const res = await axiosInstance.get(UrlConstants.ADMIN_EMPLOYEE_URL, {
    params: { page: params?.page ?? 1, limit: params?.limit ?? 999, search: params?.search ?? "" },
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

export async function updateAccountant(args: { id: string; data: T_AccountantSchema }) {
  const response: T_AxiosResponseWithoutPagination<T_ACCOUNTANT> = await axiosInstance.patch(
    `${UrlConstants.ACCOUNTANT_URL}/${args.id}`,
    args.data,
  );
  return response.data;
}

export async function removeAccountant(id: string) {
  const response: T_AxiosResponseWithoutPagination<unknown> = await axiosInstance.delete(
    `${UrlConstants.ACCOUNTANT_URL}/${id}`,
  );
  return response.data;
}
