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
  photoUrl?: string | null;
  admissionDateBs: string;
  status: T_STUDENT_STATUS;
  approvalStatus: T_STUDENT_APPROVAL;
  rejectionReason?: string | null;
  createdBy?: string;
  batch?: { id?: string; name?: string; course?: { id?: string; code?: string; name?: string } };
};

export async function getStudent(id: string): Promise<{ data: T_STUDENT }> {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_STUDENTS_URL}/${id}`);
  return res.data;
}

export async function listStudentsForTeacher(params: {
  page: number;
  limit: number;
  search?: string;
  batchId?: string;
  approvalStatus?: T_STUDENT_APPROVAL | "";
}) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_STUDENTS_URL}`, { params });
  return res.data;
}

export type CreateStudentInput = {
  firstName: string;
  middleName?: string;
  lastName: string;
  universityRegNo: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  dobBs?: string;
  admissionDateBs: string;
  batchId: string;
  phone?: string;
  email?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  guardian: { relation: Guardian["relation"]; fullName: string; phone?: string; email?: string; occupation?: string; address?: string };
};

export async function createStudent(input: CreateStudentInput): Promise<{ message: string; id: string }> {
  const res = await axiosInstance.post(`${UrlConstants.TEACHER_STUDENTS_URL}`, input);
  return res.data;
}

export type UpdateStudentInput = Partial<{
  universityRegNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHERS";
  dobBs?: string;
  admissionDateBs?: string;
  phone?: string;
  email?: string;
  permanentAddress?: string;
  temporaryAddress?: string;
  batchId?: string;
  status: T_STUDENT_STATUS;
  approvalStatus: T_STUDENT_APPROVAL;
  rejectionReason?: string;
}>;

export async function updateStudent(id: string, input: UpdateStudentInput): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.TEACHER_STUDENTS_URL}/${id}`, input);
  return res.data;
}

export async function listStudents(params: { page: number; limit: number; search?: string; approvalStatus?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_STUDENTS_URL}`, { params });
  return res.data;
}

export async function listApprovedStudents(params: { page: number; limit: number; search?: string }) {
  return listStudents({ ...params, approvalStatus: "APPROVED" });
}
