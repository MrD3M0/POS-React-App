import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_TEACHING_ASSIGNMENT = {
  id: string;
  teacherId: string;
  batchTermSubjectId: string;
  assignedDateBs: string;
  endDateBs?: string | null;
  isActive?: boolean;
  createdAt?: string;
  teacher?: {
    id: string;
    employee?: { firstName?: string; middleName?: string | null; lastName?: string; employeeCode?: string };
  };
  batchTermSubject?: {
    id: string;
    subject?: { code?: string; name?: string };
    batchTerm?: { termNumber?: number; name?: string; batch?: { name?: string } };
  };
};

export type T_TEACHER_OPTION = {
  id: string;
  employee?: { firstName?: string; middleName?: string | null; lastName?: string; employeeCode?: string };
};

export type T_BATCH_TERM_SUBJECT_OPTION = {
  id: string;
  subject?: { code?: string; name?: string };
  batchTerm?: { termNumber?: number; name?: string; batch?: { name?: string } };
};

type T_Paginated<T> = { data: { data: T[]; pagination: { page: number; limit: number; total: number } } };

export async function listTeachingAssignments(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get<T_Paginated<T_TEACHING_ASSIGNMENT>>(`${UrlConstants.TEACHING_ASSIGNMENT_URL}`, { params });
  return res.data;
}

export async function createTeachingAssignment(input: {
  teacherId: string;
  batchTermSubjectId: string;
  assignedDateBs: string;
  endDateBs?: string;
  isActive?: boolean;
}): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.TEACHING_ASSIGNMENT_URL}`, input);
  return res.data;
}

export async function deleteTeachingAssignment(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.TEACHING_ASSIGNMENT_URL}/${id}`);
  return res.data;
}

export async function listTeachers(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get<T_Paginated<T_TEACHER_OPTION>>(`${UrlConstants.TEACHER_URL}`, { params });
  return res.data;
}

export async function listBatchTermSubjects(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get<T_Paginated<T_BATCH_TERM_SUBJECT_OPTION>>(`${UrlConstants.BATCH_TERM_SUBJECT_URL}`, { params });
  return res.data;
}
