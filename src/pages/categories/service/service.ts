import { UrlConstants } from "@/constants/endpoints";
import axiosInstance from "@/lib/axios-request";
import type { T_AxiosResponseWithPagination } from "@/types/common";

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
