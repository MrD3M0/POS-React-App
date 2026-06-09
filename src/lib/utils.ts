import type { T_UseQueryError } from "@/types/common";
import type { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { type Path, type UseFormSetError } from 'react-hook-form';
import { twMerge } from "tailwind-merge";
import moment from 'moment';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mapFieldsOnError = <T extends Record<string, unknown>>(
  err: AxiosError<T_UseQueryError>,
  setError: UseFormSetError<T>,
  handleDeepErrors = false,
) => {
  if (err.response?.data.status !== 422) return;
  const data = err.response?.data.data;
  if (!data) return;

  Object.entries(data).forEach(([key, value]) => {
    // Check if deep errors exist
    if (key === "_deepErrors") {
      if (!handleDeepErrors) return;
      const deepErrors = (value as any).issues as unknown as {
        code: string;
        message: string;
        path: string[];
      }[];

      // For each deep error, set the error on the form
      deepErrors.forEach((deepError) => {
        const path = deepError.path.join(".");
        setError(path as Path<T>, {
          type: "manual",
          message: deepError.message,
        });
      });
      return;
    }

    const error = value[0];
    setError(key as Path<T>, {
      type: "manual",
      message: error,
    });
  });
};
export const formatDate = (date: string | Date) => {
  return moment(date).format("YYYY-MM-DD");
};

export const getPaginationItems = (
  total: number,
  currentPage: number,
  delta: number = 2,
) => {
  const range: number[] = [];
  const pagination: (number | string)[] = [];
  let last: number = 0;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  for (const page of range) {
    if (last) {
      if (page - last === 2) {
        pagination.push(last + 1);
      } else if (page - last > 2) {
        pagination.push("...");
      }
    }
    pagination.push(page);
    last = page;
  }

  return pagination;
};
