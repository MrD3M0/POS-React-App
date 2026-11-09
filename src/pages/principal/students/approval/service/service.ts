import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_STUDENT_APPROVAL = "PENDING" | "APPROVED" | "REJECTED";

export type T_PENDING_STUDENT = {
  id: string;
  universityRegNo: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender?: string;
  phone?: string | null;
  email?: string | null;
  admissionDateBs?: string;
  status?: string;
  approvalStatus: T_STUDENT_APPROVAL;
  rejectionReason?: string | null;
  batch?: { id?: string; name?: string; course?: { code?: string; name?: string } } | null;
};

export async function listPendingStudents(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.STUDENT_URL}`, {
    params: { ...params, approvalStatus: "PENDING" },
  });
  return res.data;
}

export async function approveStudent(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.STUDENT_URL}/${id}/approve`);
  return res.data;
}

export async function rejectStudent(id: string, reason?: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.STUDENT_URL}/${id}/reject`, {
    rejectionReason: reason,
  });
  return res.data;
}
