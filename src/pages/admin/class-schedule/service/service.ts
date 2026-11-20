import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_EMPLOYEE_BRIEF = {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  employeeCode?: string;
};

export type T_CLASS_SCHEDULE = {
  id: string;
  teachingAssignmentId: string;
  periodId: string;
  dayOfWeek: string;
  room?: string | null;
  effectiveFromBs: string;
  effectiveToBs?: string | null;
  isActive?: boolean;
  createdAt?: string;
  period?: {
    id: string;
    name: string;
    periodNumber: number;
    startTime: string;
    endTime: string;
    isActive?: boolean;
  };
  teachingAssignment?: {
    id: string;
    teacherId: string;
    teacher?: { id: string; employee?: T_EMPLOYEE_BRIEF | null };
    batchTermSubject?: {
      id: string;
      isElective?: boolean;
      subject?: { id?: string; code?: string; name?: string };
      batchTerm?: {
        id?: string;
        termNumber?: number;
        name?: string;
        batch?: { id?: string; name?: string };
      };
    };
  };
};

export type T_TEACHING_ASSIGNMENT_OPTION = {
  id: string;
  isActive?: boolean;
  teacher?: { id: string; employee?: T_EMPLOYEE_BRIEF | null };
  batchTermSubject?: {
    id: string;
    isElective?: boolean;
    subject?: { code?: string; name?: string };
    batchTerm?: { termNumber?: number; name?: string; batch?: { name?: string } };
  };
};

export type T_PERIOD_OPTION = {
  id: string;
  name: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
};

type T_Paginated<T> = { data: { data: T[]; pagination: { page: number; limit: number; total: number } } };

export async function listClassSchedules(params: {
  page: number;
  limit: number;
  search?: string;
  teacherId?: string;
  batchTermId?: string;
  dayOfWeek?: string;
  periodId?: string;
}) {
  const res = await axiosInstance.get<T_Paginated<T_CLASS_SCHEDULE>>(`${UrlConstants.CLASS_SCHEDULE_URL}`, { params });
  return res.data;
}

export async function createClassSchedule(input: {
  teachingAssignmentId: string;
  periodId: string;
  dayOfWeek: string;
  room?: string | null;
  effectiveFromBs: string;
  effectiveToBs?: string | null;
  isActive?: boolean;
}): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.CLASS_SCHEDULE_URL}`, input);
  return res.data;
}

export async function getClassSchedule(id: string): Promise<T_CLASS_SCHEDULE | null> {
  const res = await axiosInstance.get(`${UrlConstants.CLASS_SCHEDULE_URL}/${id}`);
  return (res.data as { data?: T_CLASS_SCHEDULE })?.data ?? null;
}

export async function updateClassSchedule(
  id: string,
  input: {
    teachingAssignmentId?: string;
    periodId?: string;
    dayOfWeek?: string;
    room?: string | null;
    effectiveFromBs?: string;
    effectiveToBs?: string | null;
    isActive?: boolean;
  },
): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.CLASS_SCHEDULE_URL}/${id}`, input);
  return res.data;
}

export async function deleteClassSchedule(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.CLASS_SCHEDULE_URL}/${id}`);
  return res.data;
}

export async function listTeachingAssignmentOptions(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get<T_Paginated<T_TEACHING_ASSIGNMENT_OPTION>>(
    `${UrlConstants.TEACHING_ASSIGNMENT_URL}`,
    { params },
  );
  return res.data;
}

export async function listPeriodOptions(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get<T_Paginated<T_PERIOD_OPTION>>(`${UrlConstants.PERIOD_URL}`, { params });
  return res.data;
}
