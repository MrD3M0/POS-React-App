import { QueryClient } from "@tanstack/react-query";

export const QUERY_KEYS = {
  CURRENT_USER: "current-user",
  CATEGORY: "categories"
};

export const queryClient = new QueryClient();
