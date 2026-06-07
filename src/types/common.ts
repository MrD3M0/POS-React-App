import { AxiosError, type AxiosResponse } from "axios";

export type T_AxiosResponseWithoutPagination<T> = AxiosResponse<{
  success: boolean;
  message: string;
  code: number;
  data: T;
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
