import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_STUDENT_STATUS = "ACTIVE" | "GRADUATED" | "DROPPED" | "SUSPENDED";
export type T_STUDENT_APPROVAL = "PENDING" | "APPROVED" | "REJECTED";

export type Guardian = {
  id?: string;
  relation: "FATHER" | "MOTHER" | "GUARDIAN" | "OTHER";
  fullName: string;
  phone?: string;
  email?: string;
  occupation?: string;
  address?: string;
};

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

export async function listStudentsForTeacher(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_STUDENTS_URL}`, { params });
  return res.data as never;
}

export async function createStudent(input: {
  firstName: string; lastName: string; universityRegNo: string; gender: "MALE" | "FEMALE" | "OTHERS";
  dobBs?: string; batchId?: string; phone?: string; email?: string; permanentAddress?: string; temporaryAddress?: string;
  guardian: { relation: Guardian["relation"]; fullName: string; phone?: string; email?: string; occupation?: string; address?: string };
}): Promise<{ message: string; id: string }> {
  const res = await axiosInstance.post(`${UrlConstants.TEACHER_STUDENTS_URL}`, input);
  return res.data as never;
}

export async function updateStudent(id: string, input: Partial<T_STUDENT>): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.ADMIN_STUDENT_URL}/${id}`, input);
  return res.data as never;
}

export async function listApprovedStudents(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_STUDENTS_URL}/approved`, { params });
  return res.data as never;
}
