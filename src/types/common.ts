import { AxiosError, type AxiosResponse } from "axios";

export type T_AxiosResponseWithoutPagination<T> = AxiosResponse<{
  success: boolean;
  message: string;
  code: number;
  data: T;
}>;
export type T_AxiosResponseWithoutAnything = AxiosResponse<{
  success: boolean;
  message: string;
  code: number;
}>;
export type T_AxiosResponseWithPagination<T> = AxiosResponse<{
  success: boolean;
  message: string;
  code: number;
  data: {
    data: T[];
    pagination: {
      limit: number;
      page: number;
      total: number;
    };
  };
}>;

export type T_Response<T_Data> = {
  success: boolean;
  status: number;
  message: string;
  // pagination?: T_PaginatedResponse;
  data: T_Data;
};
export type T_ValidationError = T_Response<{
  [key: string]: string[];
}>;
export type T_UseQueryError = T_ValidationError | T_Response<[]>;
export type T_MutationError = AxiosError<T_UseQueryError>;

export type T_ApiParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export type T_TableHead = {
  key: string;
  label: string;
};

/** Pagination metadata returned by every backend list endpoint. */
export type T_Pagination = {
  limit: number;
  page: number;
  total: number;
};

/**
 * Normalized list body. `ResponseHandler.success` wraps every `Array` payload
 * that is sent together with pagination into `{ data, pagination }`, so all
 * backend list endpoints resolve to this exact shape.
 */
export type T_ListBody<T> = {
  success: boolean;
  code: number;
  message: string;
  data: {
    data: T[];
    pagination: T_Pagination;
  };
  meta?: unknown;
};

/** Single-record body (`GET /:id`, `POST`, `PATCH`). */
export type T_ItemBody<T> = {
  success: boolean;
  code: number;
  message: string;
  data: T;
  meta?: unknown;
};

/** Body returned by `DELETE` endpoints. */
export type T_DeleteBody = {
  success: boolean;
  code: number;
  message: string;
  data?: unknown;
  meta?: unknown;
};

export type T_ListParams = {
  page?: number;
  limit?: number;
  search?: string;
};
