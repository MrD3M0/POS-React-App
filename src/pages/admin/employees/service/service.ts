import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_EMPLOYEE_ROLE = "PRINCIPAL" | "ACCOUNTANT" | "TEACHER" | "STAFF";

export type T_EMPLOYEE_USER = {
  id: string;
  email?: string | null;
  username?: string | null;
  role?: T_EMPLOYEE_ROLE | null;
};

export type T_EMPLOYEE = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName?: string;
  middleName?: string | null;
  email?: string | null;
  passwordHash?: string | null;
  role?: T_EMPLOYEE_ROLE | null;
  user?: T_EMPLOYEE_USER | null;
  designation: string;
  phone?: string | null;
  gender: "MALE" | "FEMALE" | "OTHERS";
  dobBs?: string | null;
  joinDateBs?: string | null;
  permanentAddress?: string | null;
  temporaryAddress?: string | null;
  ssfNo?: string | null;
  bankAccountNo?: string | null;
  bankName?: string | null;
  panNo?: string | null;
  isActive: boolean;
  createdAt?: string;
};

export async function listEmployees(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_EMPLOYEE_URL}`, { params });
  return res.data;
}

export async function getEmployeeById(id: string): Promise<{ data: T_EMPLOYEE }> {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_EMPLOYEE_URL}/${id}`);
  return res.data;
}

export async function createEmployee(input: {
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password?: string;
  role?: T_EMPLOYEE_ROLE;
  designation: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  phone?: string;
  dobBs?: string;
  joinDateBs: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  panNo?: string;
  ssfNo?: string;
  bankName?: string;
  bankAccountNo?: string;
}): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_EMPLOYEE_URL}`, input);
  return res.data;
}

export async function updateEmployee(
  id: string,
  input: Partial<{
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    designation: string;
    gender: "MALE" | "FEMALE" | "OTHERS";
    phone?: string;
    dobBs?: string;
    joinDateBs?: string;
    permanentAddress?: string;
    temporaryAddress?: string;
    panNo?: string;
    ssfNo?: string;
    bankName?: string;
    bankAccountNo?: string;
    isActive: boolean;
  }>,
): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.ADMIN_EMPLOYEE_URL}/${id}`, input);
  return res.data;
}

export async function deleteEmployee(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_EMPLOYEE_URL}/${id}`);
  return res.data;
}

export async function resetUserPassword(userId: string, password: string): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.USER_URL}/${userId}/password`, { password });
  return res.data;
}
