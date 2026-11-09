import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_NOTICE = {
  id: string;
  title: string;
  body: string;
  isPinned?: boolean;
  isPublished: boolean;
  createdAt?: string;
};

export async function listNotices(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.NOTICE_URL}`, { params });
  return res.data;
}
