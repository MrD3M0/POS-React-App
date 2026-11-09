import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_NOTICE = {
  id: string;
  title: string;
  body: string;
  content?: string;
  isPinned?: boolean;
  isPublished: boolean;
  published?: boolean;
  createdAt?: string;
  [key: string]: unknown;
};

export async function listTeacherNotices(params: { page: number; limit: number; search?: string; role?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_NOTICES_URL}`, { params });
  return res.data;
}

export async function getTeacherNoticeById(id: string) {
  const res = await axiosInstance.get(`${UrlConstants.TEACHER_NOTICES_URL}/${id}`);
  return res.data;
}
