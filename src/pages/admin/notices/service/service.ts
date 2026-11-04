import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_NOTICE_STATUS = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type T_NOTICE = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  status: T_NOTICE_STATUS;
  createdAt?: string;
  updatedAt?: string;
};

export async function listNotices(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(`${UrlConstants.NOTICES_URL}`, { params });
  return res.data as never;
}

export async function createNotice(input: { title: string; content: string }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.NOTICES_URL}`, input);
  return res.data as never;
}

export async function publishNotice(id: string): Promise<{ message: string }> {
  const res = await axiosInstance.put(`${UrlConstants.NOTICES_URL}/${id}/publish`);
  return res.data as never;
}
