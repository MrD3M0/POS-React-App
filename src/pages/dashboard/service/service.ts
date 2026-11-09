import type { T_Sales, T_BestProductSellers, T_ProductAlert } from "../schema/schema";
import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type { T_AxiosResponseWithoutPagination, T_AxiosResponseWithPagination } from "@/types/common";

export const getLifeTimeSales = async () => {
  // Fetch all fee payments and summarize
  const response = await axiosInstance.get(`${UrlConstants.FEE_PAYMENT_URL}`, {
    params: { limit: 1000 },
  });
  const payments = response.data.data ?? [];
  const totalBills = payments.length;
  const totalSales = payments.reduce(
    (sum: number, payment: { allocations?: { amount: number }[] }) =>
      sum + (payment.allocations?.reduce((a: number, c: { amount: number }) => a + c.amount, 0) ?? 0),
    0,
  );
  return {
    data: {
      totalBills,
      totalSales,
    } as T_Sales,
  };
};

export const getBestSellers = async (args: { limit: number; page: number }) => {
  const response: T_AxiosResponseWithPagination<T_BestProductSellers> =
    await axiosInstance.get(`${UrlConstants.COURSE_URL}`, {
      params: {
        page: args.page || 1,
        limit: args.limit || 10,
      },
    });
  return response.data;
};

export const getStockALert = async () => {
  const response: T_AxiosResponseWithoutPagination<T_ProductAlert[]> =
    await axiosInstance.get(`${UrlConstants.STUDENT_FEE_URL}/low-stock`);
  return response.data;
};
