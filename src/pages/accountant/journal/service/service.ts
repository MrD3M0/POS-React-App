import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";

export type T_JOURNAL_LINE = {
  id: string;
  accountCode: string;
  description: string;
  amount: number;
  direction: "DEBIT" | "CREDIT";
};

export type T_JOURNAL_ENTRY = {
  id: string;
  description: string;
  lines: T_JOURNAL_LINE[];
  debitTotal: number;
  creditTotal: number;
  balance?: number;
  groupAccount?: boolean;
  dateBs?: string;
  posted: boolean;
  reversed: boolean;
  details?: string;
  createdAt?: string;
};

export async function listJournalEntries(params: { page: number; limit: number }) {
  const res = await axiosInstance.get(`${UrlConstants.ACCOUNTANT_JOURNAL_URL}`, { params });
  return res.data as never;
}

export async function postJournalEntry(input: { lines: T_JOURNAL_LINE[]; dateBs?: string }): Promise<{ message: string; posted?: boolean; balance?: number; warning?: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_JOURNAL_URL}`, input);
  return res.data as never;
}

// Reverse a mistake — only ever called on an already-posted entry, never edited or deleted
export async function reverseJournalEntry(entryId: string): Promise<{ message: string }> {
  const res = await axiosInstance.post(`${UrlConstants.ACCOUNTANT_JOURNAL_URL}/${entryId}/reverse`);
  return res.data as never;
}
