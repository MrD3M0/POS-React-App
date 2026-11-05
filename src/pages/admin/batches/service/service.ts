import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type {
  T_AxiosResponseWithoutPagination,
  T_AxiosResponseWithPagination,
} from "@/types/common";

export type T_COURSE = {
  id: string;
  code: string;
  name: string;
  system: "SEMESTER" | "YEARLY";
  totalTerms: number;
  description?: string | null;
  isActive: boolean;
};

export type T_BATCH = {
  id: string;
  courseId: string;
  name: string;
  startDateBs?: string | null;
  currentTermNumber: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course?: T_COURSE;
};

export type T_BATCH_CREATE_INPUT = {
  courseId: string;
  name: string;
  startDateBs?: string;
  currentTermNumber?: number;
  isActive?: boolean;
};

export type T_BATCH_UPDATE_INPUT = Partial<T_BATCH_CREATE_INPUT>;

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

export async function listBatches(params: {
  page: number;
  limit: number;
  search?: string;
  courseId?: string;
  isActive?: boolean;
}) {
  const response: T_AxiosResponseWithPagination<T_BATCH> =
    await axiosInstance.get(`${UrlConstants.BATCH_URL}`, { params });
  return response.data;
}

export async function getBatchById(id: string) {
  const response: T_AxiosResponseWithoutPagination<T_BATCH> =
    await axiosInstance.get(`${UrlConstants.BATCH_URL}/${id}`);
  return response.data;
}

export async function createBatch(input: T_BATCH_CREATE_INPUT) {
  const response: T_AxiosResponseWithoutPagination<T_BATCH> =
    await axiosInstance.post(`${UrlConstants.BATCH_URL}`, input);
  return response.data;
}

export async function updateBatch(id: string, input: T_BATCH_UPDATE_INPUT) {
  const response: T_AxiosResponseWithoutPagination<T_BATCH> =
    await axiosInstance.patch(`${UrlConstants.BATCH_URL}/${id}`, input);
  return response.data;
}

export async function deleteBatch(id: string) {
  const response: T_AxiosResponseWithoutPagination<null> =
    await axiosInstance.delete(`${UrlConstants.BATCH_URL}/${id}`);
  return response.data;
}

/** Move a batch to its next term: PATCH /batch/:id with currentTermNumber + 1. */
export async function moveBatchToNextTerm(
  batchId: string,
  nextTermNumber: number,
) {
  const response: T_AxiosResponseWithoutPagination<T_BATCH> =
    await axiosInstance.patch(`${UrlConstants.BATCH_URL}/${batchId}`, {
      currentTermNumber: nextTermNumber,
    });
  return response.data;
}

export async function listTerms(params: {
  page?: number;
  limit?: number;
  search?: string;
  batchId?: string;
}) {
  const response: T_AxiosResponseWithPagination<T_TERM> =
    await axiosInstance.get(`${UrlConstants.BATCH_TERM_URL}`, { params });
  return response.data;
}
