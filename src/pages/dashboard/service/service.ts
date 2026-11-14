import type {
  T_BestProductSellers,
  T_ProductAlert,
  T_Sales,
} from "../schema/schema";
import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type {
  T_AxiosResponseWithoutPagination,
  T_AxiosResponseWithPagination,
} from "@/types/common";

export const getLifeTimeSales = async () => {
  const response: T_AxiosResponseWithoutPagination<T_Sales> =
    await axiosInstance.get(`${UrlConstants.BILLING_URL}/sales/total`);
  return response.data;
};

export const getBestSellers = async (args: { limit: number; page: number }) => {
  const response: T_AxiosResponseWithPagination<T_BestProductSellers> =
    await axiosInstance.get(`${UrlConstants.BILLING_URL}/best-selling`, {
      params: {
        page: args.page || 1,
        limit: args.limit || 10,
      },
    });
  return response.data;
};

export const getStockALert = async () => {
  const response: T_AxiosResponseWithoutPagination<T_ProductAlert[]> =
    await axiosInstance.get(`${UrlConstants.BILLING_URL}/stock-alert`);
  return response.data;
};
