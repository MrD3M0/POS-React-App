import type {
  T_AxiosResponseWithoutPagination,
  T_AxiosResponseWithPagination,
} from "@/types/common";
import type { T_ProductSchema } from "../schema/schema";
import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_Products = {
  id: string;
  name: string;
  shortName: string;
  price: number;
  quantity: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
};

export const getAllProducts = async (args: {
  page?: number;
  search?: string;
  limit?: number;
}) => {
  const response: T_AxiosResponseWithPagination<T_Products> =
    await axiosInstance.get(`${UrlConstants.PRODUCT_URL}`, {
      params: {
        page: args.page,
        limit: args.limit,
        search: args.search || "",
      },
    });
  return response.data;
};
// service/service.ts
export const createProduct = async (data: T_ProductSchema) => {
  const response: T_AxiosResponseWithoutPagination<T_ProductSchema> =
    await axiosInstance.post(`${UrlConstants.PRODUCT_URL}`, data);
  return response.data;
};

export const getProductById = async (id: string) => {
  const response: T_AxiosResponseWithoutPagination<T_ProductSchema> =
    await axiosInstance.get(`${UrlConstants.PRODUCT_URL}/${id}`);
  return response.data;
};

export const updateProduct = async (args: {
  id: string;
  data: T_ProductSchema;
}) => {
  const response: T_AxiosResponseWithoutPagination<T_ProductSchema> =
    await axiosInstance.patch(
      `${UrlConstants.PRODUCT_URL}/${args.id}`,
      args.data,
    );
  return response.data;
};

export const removeProduct = async (id: string) => {
  const response = await axiosInstance.delete(
    `${UrlConstants.PRODUCT_URL}/${id}`,
  );
  return response.data;
};
