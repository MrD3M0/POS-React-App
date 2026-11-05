/**
 * Shared helpers for the accountant pages.
 *
 * The backend does not use one list-envelope shape everywhere:
 *  - nested: `{ success, code, message, data: { data: T[], pagination } }`
 *    (fee-structure, course, batch, fee-head, employee, student, salary-structure, …)
 *  - flat:   `{ success, code, message, data: T[], pagination }`
 *    (fee-payment, journal-entry, journal-line, payroll, payslip,
 *     employee-attendance, account, fiscal-year, payment-method, …)
 *
 * Pages consume the nested shape (`query.data?.data?.data`), so flat-list
 * services normalize their responses with `normalizeListBody`.
 */
import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import type { T_AxiosResponseWithPagination } from "@/types/common";

export type T_ListBody<T> = T_AxiosResponseWithPagination<T>["data"];
export type T_ItemBody<T> = {
  success: boolean;
  code: number;
  message: string;
  data: T;
};
export type T_NullBody = {
  success: boolean;
  code: number;
  message: string;
  data: null;
};

type T_FlatListBody<T> = {
  success: boolean;
  code: number;
  message: string;
  data: T[];
  pagination: { page: number; limit: number; total: number };
};

/** Normalize a flat or nested backend list body into the nested shape. */
export function normalizeListBody<T>(
  body: T_ListBody<T> | T_FlatListBody<T>,
): T_ListBody<T> {
  if (Array.isArray(body.data)) {
    const flat = body as T_FlatListBody<T>;
    return {
      success: flat.success,
      code: flat.code,
      message: flat.message,
      data: { data: flat.data, pagination: flat.pagination },
    };
  }
  return body as T_ListBody<T>;
}

// ── Picker types (read-only lookups used by several accountant pages) ───────

export type T_COURSE = {
  id: string;
  code: string;
  name: string;
  totalTerms: number;
  isActive: boolean;
};

export type T_BATCH = {
  id: string;
  courseId: string;
  name: string;
  isActive: boolean;
};

export type T_FEE_HEAD = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type T_STUDENT = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  universityRegNo: string;
  batchId: string;
};

export type T_FISCAL_YEAR = {
  id: string;
  name: string;
  startDateBs: string;
  endDateBs: string;
  isCurrent: boolean;
  isClosed: boolean;
};

export type T_ACCOUNT = {
  id: string;
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
  parentId?: string | null;
  isGroup: boolean;
  isSystem: boolean;
  isActive: boolean;
};

export type T_PAYMENT_METHOD = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type T_EMPLOYEE = {
  id: string;
  employeeCode: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  designation: string;
  isActive: boolean;
};

export type T_JOURNAL_LINE = {
  id: string;
  journalEntryId: string;
  accountId: string;
  debit: string;
  credit: string;
  description?: string | null;
  studentId?: string | null;
  employeeId?: string | null;
  account?: T_ACCOUNT;
  createdAt?: string;
};

export type T_PAYROLL = {
  id: string;
  fiscalYearId: string;
  yearBs: number;
  monthBs: number;
  totalDays: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  submittedAt?: string | null;
  paidDateBs?: string | null;
  remarks?: string | null;
  journalEntryId?: string | null;
  createdAt?: string;
};

export type T_SALARY_STRUCTURE = {
  id: string;
  employeeId: string;
  basicSalary: string;
  effectiveFromBs: string;
  effectiveToBs?: string | null;
  remarks?: string | null;
  employee?: T_EMPLOYEE;
  items?: {
    id: string;
    salaryStructureId: string;
    componentId: string;
    amount: string;
    isPercentOfBasic: boolean;
  }[];
};

export const fullName = (p: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}): string =>
  [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");

// ── Shared picker/list reads (real endpoints) ────────────────────────────────

export async function listCourses(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<T_ListBody<T_COURSE>> {
  const res = await axiosInstance.get<T_ListBody<T_COURSE>>(UrlConstants.COURSE_URL, {
    params,
  });
  return res.data;
}

export async function listBatches(params: {
  page: number;
  limit: number;
  search?: string;
  courseId?: string;
}): Promise<T_ListBody<T_BATCH>> {
  const res = await axiosInstance.get<T_ListBody<T_BATCH>>(UrlConstants.BATCH_URL, {
    params,
  });
  return res.data;
}

export async function listFeeHeads(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<T_ListBody<T_FEE_HEAD>> {
  const res = await axiosInstance.get<T_ListBody<T_FEE_HEAD>>(UrlConstants.FEE_HEAD_URL, {
    params,
  });
  return res.data;
}

export async function listStudents(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<T_ListBody<T_STUDENT>> {
  const res = await axiosInstance.get<T_ListBody<T_STUDENT>>(UrlConstants.STUDENT_URL, {
    params,
  });
  return res.data;
}

export async function listFiscalYears(params: {
  page: number;
  limit: number;
}): Promise<T_ListBody<T_FISCAL_YEAR>> {
  const res = await axiosInstance.get<T_FlatListBody<T_FISCAL_YEAR>>(
    UrlConstants.FISCAL_YEAR_URL,
    { params },
  );
  return normalizeListBody(res.data);
}

export async function listPaymentMethods(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<T_ListBody<T_PAYMENT_METHOD>> {
  const res = await axiosInstance.get<T_FlatListBody<T_PAYMENT_METHOD>>(
    UrlConstants.PAYMENT_METHOD_URL,
    { params },
  );
  return normalizeListBody(res.data);
}

export async function listAccounts(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<T_ListBody<T_ACCOUNT>> {
  const res = await axiosInstance.get<T_FlatListBody<T_ACCOUNT>>(UrlConstants.ACCOUNT_URL, {
    params,
  });
  return normalizeListBody(res.data);
}

export async function listEmployees(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<T_ListBody<T_EMPLOYEE>> {
  const res = await axiosInstance.get<T_ListBody<T_EMPLOYEE>>(UrlConstants.EMPLOYEE_URL, {
    params,
  });
  return res.data;
}

export async function listJournalLines(params: {
  page: number;
  limit: number;
  /** Backend `search` does a contains-match on accountId / studentId / employeeId. */
  search?: string;
}): Promise<T_ListBody<T_JOURNAL_LINE>> {
  const res = await axiosInstance.get<T_FlatListBody<T_JOURNAL_LINE>>(
    UrlConstants.JOURNAL_LINE_URL,
    { params },
  );
  return normalizeListBody(res.data);
}

export async function listSalaryStructures(params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<T_ListBody<T_SALARY_STRUCTURE>> {
  const res = await axiosInstance.get<T_ListBody<T_SALARY_STRUCTURE>>(
    UrlConstants.SALARY_STRUCTURE_URL,
    { params },
  );
  return res.data;
}
