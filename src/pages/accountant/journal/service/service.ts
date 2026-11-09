import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import { normalizeListBody, type T_ListBody } from "@/pages/accountant/service-utils";
import type { JournalEntryCreateFormValues } from "../schema/schema";

export type T_JOURNAL_LINE = {
  id?: string;
  accountId?: string;
  accountCode?: string;
  description?: string | null;
  debit?: number | string;
  credit?: number | string;
  amount?: number;
  direction?: "DEBIT" | "CREDIT";
  studentId?: string | null;
  employeeId?: string | null;
  account?: { id: string; code?: string; name?: string };
};

export type T_JOURNAL_ENTRY = {
  id: string;
  entryNo?: string;
  description: string;
  dateBs?: string;
  source?: string;
  lines?: T_JOURNAL_LINE[];
  debitTotal?: number;
  creditTotal?: number;
  balance?: number;
  groupAccount?: boolean;
  posted?: boolean;
  isReversed?: boolean;
  createdAt?: string;
};

export async function listJournalEntries(params: { page: number; limit: number; search?: string }) {
  const res = await axiosInstance.get(UrlConstants.ACCOUNTANT_JOURNAL_URL, { params });
  return normalizeListBody(res.data as T_ListBody<T_JOURNAL_ENTRY>);
}

export async function postJournalEntry(input: JournalEntryCreateFormValues): Promise<{ message: string; data?: unknown }> {
  const payload = {
    fiscalYearId: input.fiscalYearId,
    dateBs: input.dateBs,
    description: input.description.trim(),
    source: input.source ?? "MANUAL",
    lines: input.lines.map((l) => ({
      accountId: l.accountId,
      debit: l.direction === "DEBIT" ? Number(l.amount) : undefined,
      credit: l.direction === "CREDIT" ? Number(l.amount) : undefined,
      description: l.description?.trim() || undefined,
      studentId: l.studentId?.trim() || undefined,
      employeeId: l.employeeId?.trim() || undefined,
    })),
  };
  const res = await axiosInstance.post(UrlConstants.ACCOUNTANT_JOURNAL_URL, payload);
  return res.data;
}

export async function reverseJournalEntry(entryId: string, input?: { description?: string; dateBs?: string }): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_JOURNAL_URL}/${entryId}/reverse`, input ?? {});
  return res.data;
}
