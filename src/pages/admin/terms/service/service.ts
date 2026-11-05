import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type {
  T_AxiosResponseWithoutPagination,
  T_AxiosResponseWithPagination,
} from "@/types/common";

export type T_TERM = {
  id: string;
  batchId: string;
  termNumber: number;
  name: string;
  startDateBs?: string | null;
  endDateBs?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type T_TERM_CREATE_INPUT = {
  batchId: string;
  termNumber: number;
  name: string;
  startDateBs?: string | null;
  endDateBs?: string | null;
  isActive?: boolean;
};

export type T_TERM_UPDATE_INPUT = Partial<T_TERM_CREATE_INPUT>;

export async function listTerms(params: {
  page: number;
  limit: number;
  search?: string;
  batchId?: string;
  isActive?: boolean;
}) {
  const response: T_AxiosResponseWithPagination<T_TERM> =
    await axiosInstance.get(`${UrlConstants.ADMIN_TERM_URL}`, { params });
  return response.data;
}

export async function getTermById(id: string) {
  const response: T_AxiosResponseWithoutPagination<T_TERM> =
    await axiosInstance.get(`${UrlConstants.ADMIN_TERM_URL}/${id}`);
  return response.data;
}

export async function createTerm(input: T_TERM_CREATE_INPUT) {
  const response: T_AxiosResponseWithoutPagination<T_TERM> =
    await axiosInstance.post(`${UrlConstants.ADMIN_TERM_URL}`, input);
  return response.data;
}

export async function updateTerm(id: string, input: T_TERM_UPDATE_INPUT) {
  const response: T_AxiosResponseWithoutPagination<T_TERM> =
    await axiosInstance.patch(`${UrlConstants.ADMIN_TERM_URL}/${id}`, input);
  return response.data;
}

export async function deleteTerm(id: string) {
  const response: T_AxiosResponseWithoutPagination<null> =
    await axiosInstance.delete(`${UrlConstants.ADMIN_TERM_URL}/${id}`);
  return response.data;
}
