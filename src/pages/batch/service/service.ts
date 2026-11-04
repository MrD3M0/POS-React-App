import { UrlConstants } from "@/constants/endpoints";
import axiosInstance from "@/lib/axios-request";
import type {
  T_AxiosResponseWithoutPagination,
  T_AxiosResponseWithPagination,
} from "@/types/common";
import type { T_BatchSchema } from "../schema/schema";

export type T_Batch = {
  id: string;
  courseId: string;
  name: string;
  startDateBs?: string | null;
  currentTermNumber: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const getAllBatches = async (args: {
  page?: number;
  search?: string;
  limit?: number;
}) => {
  const response: T_AxiosResponseWithPagination<T_Batch> =
    await axiosInstance.get(`${UrlConstants.BATCH_URL}`, {
      params: {
        page: args.page,
        limit: args.limit,
        search: args.search || "",
      },
    });
  return response.data;
};

export const removeBatch = async (id: string) => {
  const response = await axiosInstance.delete(
    `${UrlConstants.BATCH_URL}/${id}`,
  );
  return response.data;
};

export const createBatch = async (data: T_BatchSchema) => {
  const response: T_AxiosResponseWithoutPagination<T_Batch> =
    await axiosInstance.post(`${UrlConstants.BATCH_URL}`, {
      courseId: data.courseId,
      name: data.name,
      startDateBs: data.startDateBs || undefined,
      currentTermNumber: data.currentTermNumber,
      isActive: data.isActive,
    });
  return response.data;
};

export const getBatchById = async (id: string) => {
  const response: T_AxiosResponseWithoutPagination<T_Batch> =
    await axiosInstance.get(`${UrlConstants.BATCH_URL}/${id}`);
  return response.data;
};

export const updateBatch = async (args: {
  data: T_BatchSchema;
  id: string;
}) => {
  const response: T_AxiosResponseWithoutPagination<T_Batch> =
    await axiosInstance.patch(`${UrlConstants.BATCH_URL}/${args.id}`, {
      courseId: args.data.courseId,
      name: args.data.name,
      startDateBs: args.data.startDateBs || undefined,
      currentTermNumber: args.data.currentTermNumber,
      isActive: args.data.isActive,
    });
  return response.data;
};
