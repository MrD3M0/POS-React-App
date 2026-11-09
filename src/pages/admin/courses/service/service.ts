import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_COURSE = {
  id: string;
  code: string;
  name: string;
  system: "SEMESTER" | "YEARLY";
  totalTerms: number;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type T_ListResponse = {
  data: { data: T_COURSE[]; pagination: { page: number; limit: number; total: number } };
};

export async function listCourses(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get<T_ListResponse>(`${UrlConstants.ADMIN_COURSE_URL}`, { params });
  return res.data;
}

export async function getCourseById(id: string): Promise<{ data: T_COURSE }> {
  const res = await axiosInstance.get(`${UrlConstants.ADMIN_COURSE_URL}/${id}`);
  return res.data;
}

export async function createCourse(input: {
  code: string;
  name: string;
  system: "SEMESTER" | "YEARLY";
  totalTerms: number;
  description?: string | null;
  isActive?: boolean;
}): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ADMIN_COURSE_URL}`, input);
  return res.data;
}

export async function updateCourse(
  id: string,
  input: Partial<{ code: string; name: string; system: "SEMESTER" | "YEARLY"; totalTerms: number; description?: string | null; isActive: boolean }>,
): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.ADMIN_COURSE_URL}/${id}`, input);
  return res.data;
}

export async function deleteCourse(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.ADMIN_COURSE_URL}/${id}`);
  return res.data;
}
