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
  attachmentUrl?: string | null;
  expiresOnBs?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type T_NOTICE_INPUT = {
  title: string;
  body: string;
  attachmentUrl?: string;
  expiresOnBs?: string | null;
  isPinned?: boolean;
  isPublished?: boolean;
};

export async function listNotices(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.NOTICE_URL}`, { params });
  return res.data;
}

export async function getNoticeById(id: string): Promise<{ data: T_NOTICE } | T_NOTICE> {
  const res = await axiosInstance.get(`${UrlConstants.NOTICE_URL}/${id}`);
  return res.data;
}

export async function createNotice(input: T_NOTICE_INPUT): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.NOTICE_URL}`, input);
  return res.data;
}

export async function updateNotice(id: string, input: Partial<T_NOTICE_INPUT>): Promise<{ message: string }> {
  const res = await axiosInstance.patch(`${UrlConstants.NOTICE_URL}/${id}`, input);
  return res.data;
}

export async function deleteNotice(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.delete(`${UrlConstants.NOTICE_URL}/${id}`);
  return res.data;
}
