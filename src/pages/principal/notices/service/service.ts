import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_NOTICE = {
  id: string;
  title: string;
  body: string;
  content?: string;
  isPinned?: boolean;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function listNotices(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.NOTICE_URL}`, { params });
  return res.data;
}

export async function toggleNoticePublished(id: string, isPublished: boolean): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.NOTICE_URL}/${id}`, { isPublished });
  return res.data;
}
