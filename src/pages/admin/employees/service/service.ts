import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_EMPLOYEE_ROLE = "PRINCIPAL" | "ACCOUNTANT" | "TEACHER" | "STAFF";

export type T_EMPLOYEE = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName?: string;
  middleName?: string | null;
  email: string;
  passwordHash?: string | null;
  role: T_EMPLOYEE_ROLE;
  designation: string;
  phone?: string | null;
  gender: "MALE" | "FEMALE" | "OTHERS";
  ssfNo?: string | null;
  bankAccountNo?: string | null;
  panNo?: string | null;
  isActive: boolean;
  createdAt?: string;
};

export async function listEmployees(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_EMPLOYEE_URL}`, { params });
  return res.data as never;
}

export async function createEmployee(input: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: T_EMPLOYEE_ROLE;
  designation?: string;
  gender?: "MALE" | "FEMALE" | "OTHERS";
  phone?: string;
}): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_EMPLOYEE_URL}`, input);
  return res.data as never;
}

export async function updateEmployee(id: string, input: Partial<{
  firstName: string;
  lastName: string;
  email: string;
  role: T_EMPLOYEE_ROLE;
  designation: string;
  isActive: boolean;
}>): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_EMPLOYEE_URL}/${id}`, input);
  return res.data as never;
}

export async function deleteEmployee(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_EMPLOYEE_URL}/${id}`);
  return res.data as never;
}
