import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type { T_EMPLOYEE } from "../users/service/service";

export type T_STUDENT_STATUS = "ACTIVE" | "GRADUATED" | "DROPPED" | "SUSPENDED";
export type T_STUDENT_APPROVAL = "PENDING" | "APPROVED" | "REJECTED";

export interface Guardian {
  id: string;
  relation: "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER";
  fullName: string;
  phone?: string;
  email?: string;
  occupation?: string;
  address?: string;
}

export type T_STUDENT = {
  id: string;
  universityRegNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  dobBs?: string | null;
  phone?: string | null;
  email?: string | null;
  permanentAddress?: string | null;
  temporaryAddress?: string | null;
  batchId?: string;
  admissionDateBs: string;
  status: T_STUDENT_STATUS;
  approvalStatus: T_STUDENT_APPROVAL;
  rejectionReason?: string | null;
  createdBy?: string;
};

export async function listStudents(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_STUDENT_URL}`, { params });
  return res.data as never;
}

export async function approveStudent(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_STUDENT_URL}/${id}/approve`);
  return res.data as never;
}

export async function rejectStudent(id: string, reason: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_STUDENT_URL}/${id}/reject`, { reason });
  return res.data as never;
}

export async function changeStudentStatus(
  id: string,
  status: T_STUDENT_STATUS,
): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_STUDENT_URL}/${id}/status`, { status });
  return res.data as never;
}

// Backwards-compat: keep an alias that matches the existing Employee service signature shape.
export type T_EmployeeView = T_EMPLOYEE;
