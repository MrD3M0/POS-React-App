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
  assignments?: Array<{
    id: string;
    teacher?: {
      employee?: { firstName?: string; middleName?: string | null; lastName?: string; employeeCode?: string };
    } | null;
  }> | null;
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

export async function listBatchTermSubjects(
  params: { page: number; limit: number; search?: string; batchTermId?: string },
) {
  const res = await axiosInstance.get<T_Paginated<T_BATCH_TERM_SUBJECT_OPTION>>(
    `${UrlConstants.BATCH_TERM_SUBJECT_URL}`,
    { params },
  );
  return res.data;
}

export type T_BATCH_OPTION = { id: string; name?: string; currentTermNumber?: number | null };
export type T_BATCH_TERM_OPTION = {
  id: string;
  name?: string;
  termNumber?: number;
  startDateBs?: string | null;
  endDateBs?: string | null;
};

export async function listBatches(params: { page: number; limit: number }) {
  const res = await axiosInstance.get<T_Paginated<T_BATCH_OPTION>>(
    `${UrlConstants.BATCH_URL}`,
    { params },
  );
  return res.data;
}

export async function listBatchTerms(params: {
  page: number;
  limit: number;
  batchId?: string;
  isActive?: boolean;
}) {
  const res = await axiosInstance.get<T_Paginated<T_BATCH_TERM_OPTION>>(
    `${UrlConstants.BATCH_TERM_URL}`,
    { params },
  );
  return res.data;
}

export type T_TEACHER_WORKLOAD = {
  teacherId: string;
  assignedSubjects: number;
  weeklyScheduledPeriods: number;
};

export async function getTeacherWorkload(teacherId: string): Promise<T_TEACHER_WORKLOAD | null> {
  if (!teacherId) return null;
  const res = await axiosInstance.get(
    `${UrlConstants.TEACHING_ASSIGNMENT_URL}/workload/${teacherId}`,
  );
  return (res.data as { data?: T_TEACHER_WORKLOAD })?.data ?? null;
}

export async function getTeachingAssignment(id: string): Promise<T_TEACHING_ASSIGNMENT | null> {
  const res = await axiosInstance.get(`${UrlConstants.TEACHING_ASSIGNMENT_URL}/${id}`);
  return (res.data as { data?: T_TEACHING_ASSIGNMENT })?.data ?? null;
}

/**
 * Updates an assignment. When `closeSchedules` is true the backend also
 * clamps the weekly schedules of this assignment to the new endDateBs.
 */
export async function updateTeachingAssignment(
  id: string,
  input: {
    assignedDateBs?: string;
    endDateBs?: string | null;
    isActive?: boolean;
    closeSchedules?: boolean;
  },
): Promise<{ message: string }> {
  const res = await axiosInstance.patch(
    `${UrlConstants.TEACHING_ASSIGNMENT_URL}/${id}`,
    input,
  );
  return res.data;
}
