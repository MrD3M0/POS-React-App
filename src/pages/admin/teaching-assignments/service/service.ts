import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_TEACHING_ASSIGNMENT = {
  id: string;
  studentId: string;
  studentName: string;
  courseCode?: string;
  subjectId: string;
  termNumber: number;
  teacherId?: string;
  assignedBy?: string;
  createdAt?: string;
};

export async function listTeachingAssignments(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHING_ASSIGNMENTS_URL}`, { params });
  return res.data as never;
}

export async function createTeachingAssignment(input: { studentId: string; courseCode?: string; subjectId: string; termNumber: number; teacherId?: string }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.TEACHING_ASSIGNMENTS_URL}`, input);
  return res.data as never;
}
