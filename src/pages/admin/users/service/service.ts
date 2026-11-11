import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_ROLE = "ADMIN" | "PRINCIPAL" | "ACCOUNTANT" | "TEACHER" | "STAFF" | "STUDENT";
export type T_EMPLOYEE_ROLE = "ADMIN" | "PRINCIPAL" | "ACCOUNTANT" | "TEACHER" | "STAFF";

export type T_EMPLOYEE = {
  id: string;
  employeeCode: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  role?: T_EMPLOYEE_ROLE | null;
  designation: string;
  joinDateBs: string;
  email?: string | null;
  isActive: boolean;
};

export type T_USER = {
  id: string;
  email: string;
  username?: string | null;
  role: T_ROLE;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  failedLoginCount?: number;
  lockedUntil?: string | null;
  createdAt?: string;
  deletedAt?: string | null;
  employee?: { id: string; employeeCode?: string; firstName?: string; lastName?: string } | null;
  student?: { id: string; universityRegNo?: string; firstName?: string; lastName?: string } | null;
};

export async function listUsers(params: {
  page: number;
  limit: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  isLocked?: boolean;
  isEmailVerified?: boolean;
  includeDeleted?: boolean;
}) {
  const res = await axiosInstance.get(UrlConstants.USER_URL, { params });
  return res.data;
}

export async function createUser(payload: {
  email: string;
  username?: string | null;
  password: string;
  role: T_ROLE;
  isActive?: boolean;
  isEmailVerified?: boolean;
}) {
  const res = await axiosInstance.post(UrlConstants.USER_URL, payload);
  return res.data;
}

export async function updateUser(id: string, payload: Partial<T_USER> & { reason?: string }) {
  const res = await axiosInstance.patch(`${UrlConstants.USER_URL}/${id}`, payload);
  return res.data;
}

export async function resetUserPassword(id: string, password: string, reason?: string) {
  const res = await axiosInstance.patch(`${UrlConstants.USER_URL}/${id}/password`, { password, reason });
  return res.data;
}

export async function unlockUser(id: string) {
  const res = await axiosInstance.patch(`${UrlConstants.USER_URL}/${id}/unlock`);
  return res.data;
}

export async function verifyUserEmail(id: string, reason: string) {
  const res = await axiosInstance.post(`${UrlConstants.USER_URL}/${id}/verify-email`, { reason });
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await axiosInstance.delete(`${UrlConstants.USER_URL}/${id}`);
  return res.data;
}

export async function restoreUser(id: string) {
  const res = await axiosInstance.patch(`${UrlConstants.USER_URL}/${id}/restore`);
  return res.data;
}

// Legacy/combined create flow used by admin/users/create.tsx (creates employee + linked user).
// Prefer /admin/employees/create or POST /api/user + linking for separated flows.
export async function createEmployee(input: {
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  role: T_EMPLOYEE_ROLE;
  dobBs?: string;
  phone?: string;
  email: string;
  password: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  designation: string;
  joinDateBs: string;
  panNo?: string;
  ssfNo?: string;
  bankName?: string;
  bankAccountNo?: string;
}) {
  const res = await axiosInstance.post(UrlConstants.EMPLOYEE_URL, input);
  return res.data;
}
