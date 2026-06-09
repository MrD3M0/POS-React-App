import axiosInstance from "@/lib/axios-request";
import type { T_AxiosResponseWithPagination } from "@/types/common";

// ─── Types ─────────────────────────────────────────────────────────────────

export type T_Category = {
  id: string;
  name: string;
}

export type T_Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  categoryId: string;
  category: T_Category;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface T_BillItem {
  id: string;
  billId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: T_Product;
}

export interface T_Bill {
  id: string;
  userId: string;
  discountType: "None" | "Percentage" | "Exact";
  discount: number;
  total: number;
  finalBillAmount: number;
  createdAt: string;
  updatedAt: string;
  billItems: T_BillItem[];
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface T_CreateBillPayload {
  products: { productId: string; quantity: number }[];
  discountType: "None" | "Percentage" | "Exact";
  discount: number;
}



// ─── Category services ──────────────────────────────────────────────────────

export const getAllCategories = async (params?: {
  limit?: number;
  page?: number;
}): Promise<{ data: { data: T_Category[] } }> => {
  const res = await axiosInstance.get("/categories", { params });
  return res.data;
};

// ─── Product services ───────────────────────────────────────────────────────

export const getAllProducts = async (params?: {
  limit?: number;
  page?: number;
}): Promise<{ data: T_AxiosResponseWithPagination<T_Product> }> => {
  const res = await axiosInstance.get("/products", { params });
  return res.data;
};

export const getProductsByCategory = async (
  categoryId: string,
  params?: { limit?: number; page?: number },
): Promise<{ data: T_AxiosResponseWithPagination<T_Product> }> => {
  const res = await axiosInstance.get(`/products/category/${categoryId}`, {
    params,
  });
  return res.data;
};

// ─── Bill services ──────────────────────────────────────────────────────────

export const createBill = async (
  payload: T_CreateBillPayload,
): Promise<{ data: T_Bill }> => {
  const res = await axiosInstance.post("/bills", payload);
  return res.data;
};

export const getAllBills = async (params?: {
  limit?: number;
  page?: number;
}): Promise<{ data: T_AxiosResponseWithPagination<T_Bill> }> => {
  const res = await axiosInstance.get("/bills", { params });
  return res.data;
};

export const getBillById = async (id: string): Promise<{ data: T_Bill }> => {
  const res = await axiosInstance.get(`/bills/${id}`);
  return res.data;
};

export const deleteBill = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/bills/${id}`);
};
