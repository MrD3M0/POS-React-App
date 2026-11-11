import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

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
  photoUrl?: string | null;
  admissionDateBs: string;
  status: T_STUDENT_STATUS;
  approvalStatus: T_STUDENT_APPROVAL;
  rejectionReason?: string | null;
  createdBy?: string;
  createdAt?: string;
  batch?: {
    id: string;
    name: string;
    course?: {
      id: string;
      code: string;
      name: string;
    };
  };
};

export async function listStudents(params: {
  page: number;
  limit: number;
  search?: string;
  status?: T_STUDENT_STATUS;
  approvalStatus?: T_STUDENT_APPROVAL;
}) {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_STUDENT_URL}`, { params });
  return res.data;
}

export async function getStudentById(id: string): Promise<{ data: T_STUDENT }> {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_STUDENT_URL}/${id}`);
  return res.data;
}

export async function createStudent(input: {
  universityRegNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  dobBs?: string;
  phone?: string;
  email?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  batchId: string;
  admissionDateBs: string;
  status?: T_STUDENT_STATUS;
  approvalStatus?: T_STUDENT_APPROVAL;
}): Promise<{ message: string; data?: { feeAssignment?: T_FEE_ASSIGNMENT } }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_STUDENT_URL}`, input);
  return res.data;
}

export async function updateStudent(
  id: string,
  input: Partial<{
    universityRegNo: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: "MALE" | "FEMALE" | "OTHERS";
    dobBs?: string;
    phone?: string;
    email?: string;
    permanentAddress?: string;
    temporaryAddress?: string;
    batchId?: string;
    admissionDateBs?: string;
    status: T_STUDENT_STATUS;
    approvalStatus: T_STUDENT_APPROVAL;
    rejectionReason?: string;
  }>,
): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.ADMIN_STUDENT_URL}/${id}`, input);
  return res.data;
}

/**
 * The fee the college assigned automatically when the student was approved
 * (batch override first, then the course default).
 */
export type T_FEE_ASSIGNMENT = {
  assigned: boolean;
  reason?: "NO_STRUCTURE" | "ALREADY_ASSIGNED" | "DISABLED" | "ERROR";
  message?: string;
  feeStructureId?: string;
  feeStructureName?: string;
  itemCount?: number;
  total?: string;
};

export type T_APPROVE_RESULT = {
  message?: string;
  data?: { feeAssignment?: T_FEE_ASSIGNMENT };
};

/** Approving is a dedicated transition (the fee is assigned automatically). */
export async function approveStudent(id: string): Promise<T_APPROVE_RESULT> {
  const res = await axiosInstance.post(`${UrlConstants.STUDENT_URL}/${id}/approve`);
  return res.data;
}

export async function rejectStudent(id: string, reason: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.STUDENT_URL}/${id}/reject`, {
    rejectionReason: reason,
  });
  return res.data;
}

export async function changeStudentStatus(
  id: string,
  status: T_STUDENT_STATUS,
): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.ADMIN_STUDENT_URL}/${id}`, { status });
  return res.data;
}

export async function deleteStudent(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_STUDENT_URL}/${id}`);
  return res.data;
}
