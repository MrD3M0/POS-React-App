import { QueryClient } from "@tanstack/react-query";

export const QUERY_KEYS = {
  CURRENT_USER: "current-user",
  CATEGORY_LIST: "categories",
  CATEGORY: "category",
  PRODUCT_LIST: "products",
  PRODUCT: "product",
  BILL_LIST: "bills",
};

export const queryClient = new QueryClient();
