import { UrlConstants } from "@/constants/endpoints";
import axiosInstance from "@/lib/axios-request";
import type {
  T_AxiosResponseWithoutPagination,
  T_AxiosResponseWithPagination,
} from "@/types/common";
import type { T_CategorySchema } from "../schema/schema";

export type T_Categories = {
  id: string;
  name: string;
  shortName: string;
  createdAt: string;
  updatedAt: string;
};
export const getAllCategories = async (args: {
  page?: number;
  search?: string;
  limit?: number;
}) => {
  const response: T_AxiosResponseWithPagination<T_Categories> =
    await axiosInstance.get(`${UrlConstants.CATEGORY_URL}`, {
      params: {
        page: args.page,
        limit: args.limit,
        search: args.search || "",
      },
    });
  return response.data;
};

export const removeCategory = async (id: string) => {
  const response = await axiosInstance.delete(
    `${UrlConstants.CATEGORY_URL}/${id}`,
  );
  return response.data;
};

export const createCategory = async (data: T_CategorySchema) => {
  const response: T_AxiosResponseWithoutPagination<T_Categories> =
    await axiosInstance.post(`${UrlConstants.CATEGORY_URL}`, {
      name: data.name,
      shortName: data.shortName,
    });
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response: T_AxiosResponseWithPagination<T_Categories> =
    await axiosInstance.get(
      `${UrlConstants.PRODUCT_URL}${UrlConstants.CATEGORY_URL}/${id}`,
    );
  return response.data;
};

export const updateCategory = async (args: {
  data: T_CategorySchema;
  id: string;
}) => {
  const response: T_AxiosResponseWithoutPagination<T_Categories> =
    await axiosInstance.patch(`${UrlConstants.CATEGORY_URL}/${args.id}`, {
      name: args.data.name,
      shortName: args.data.shortName,
    });
  return response.data;
};
