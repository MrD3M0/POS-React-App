import { UrlConstants } from "@/constants/endpoints";
import axiosInstance from "@/lib/axios-request";
import type {
  T_AxiosResponseWithoutPagination,
  T_AxiosResponseWithPagination,
} from "@/types/common";
import type { T_BatchSchema } from "../schema/schema";
import { toBatchPayload } from "../schema/schema";

export type T_Course = {
  id: string;
  code: string;
  name: string;
  system: "SEMESTER" | "YEARLY";
  totalTerms: number;
};

export type T_Batch = {
  id: string;
  courseId: string;
  name: string;
  startDateBs?: string | null;
  currentTermNumber: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  course?: T_Course;
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
    await axiosInstance.post(`${UrlConstants.BATCH_URL}`, toBatchPayload(data));
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
    await axiosInstance.patch(
      `${UrlConstants.BATCH_URL}/${args.id}`,
      toBatchPayload(args.data),
    );
  return response.data;
};
