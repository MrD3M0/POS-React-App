import axiosInstance from "@/lib/axios-request";
import { QUERY_KEYS } from "@/lib/query-keys";
import { UrlConstants } from "@/constants/endpoints";
import type { AxiosError, AxiosResponse } from "axios";

export type T_EMPLOYEE = {
  id: string;
  employeeCode: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  dobBs?: string | null;
  phone?: string | null;
  email?: string | null;
  permanentAddress?: string | null;
  temporaryAddress?: string | null;
  designation: string;
  joinDateBs: string;
  panNo?: string | null;
  ssfNo?: string | null;
  bankName?: string | null;
  bankAccountNo?: string | null;
  isActive: boolean;
};

export type T_UseQueryError = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function listEmployees(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<{ data: { data: T_EMPLOYEE[]; pagination: { total: number; limit: number; page: number } } }> {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_EMPLOYEE_URL}`, { params });
  return res.data as never;
}

export async function createEmployee(payload: Partial<T_EMPLOYEE>): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_EMPLOYEE_URL}`, payload);
  return res.data as never;
}

export async function updateEmployee(id: string, payload: Partial<T_EMPLOYEE>): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_EMPLOYEE_URL}/${id}`, payload);
  return res.data as never;
}

export async function deleteEmployee(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_EMPLOYEE_URL}/${id}`);
  return res.data as never;
}
