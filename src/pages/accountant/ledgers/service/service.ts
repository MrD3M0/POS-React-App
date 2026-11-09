import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import {
  listJournalLines,
  normalizeListBody,
} from "@/pages/accountant/service-utils";

export type T_ACCOUNT = {
  id: string;
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
  parentId?: string | null;
  isGroup: boolean;
  isSystem: boolean;
  isActive: boolean;
  _count?: { children?: number; journalLines?: number };
};

export type T_LEDGER = {
  id: string;
  code: string;
  name: string;
  type: T_ACCOUNT["type"];
  totalDebit: number;
  totalCredit: number;
  balance: number;
};

export async function listAccounts(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const res = await axiosInstance.get(UrlConstants.ACCOUNTANT_LEDGERS_URL, {
    params,
  });
  return normalizeListBody<T_ACCOUNT>(res.data);
}

async function totalsForAccount(accountId: string) {
  // One fetch per account on the page keeps this cheap (accounts are paginated,
  // so we never load the whole journal-line table). Account ids are UUIDs, so
  // the backend `search` contains-match on accountId is effectively exact.
  const first = await listJournalLines({
    page: 1,
    limit: 1000,
    search: accountId,
  });
  const lines = first.data.data;
  let totalDebit = 0;
  let totalCredit = 0;
  for (const line of lines) {
    totalDebit += Number(line.debit ?? 0) || 0;
    totalCredit += Number(line.credit ?? 0) || 0;
  }
  // Fetch any overflow pages if this account has >1000 lines.
  const total = first.data.pagination.total;
  let page = 2;
  while (lines.length < total) {
    const next = await listJournalLines({
      page,
      limit: 1000,
      search: accountId,
    });
    const nextLines = next.data.data;
    if (nextLines.length === 0) break;
    for (const line of nextLines) {
      totalDebit += Number(line.debit ?? 0) || 0;
      totalCredit += Number(line.credit ?? 0) || 0;
    }
    lines.length += nextLines.length;
    page += 1;
  }
  return { totalDebit, totalCredit };
}

export async function listLedgers(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const accountsRes = await listAccounts(params);
  const accounts = accountsRes.data.data;
  const ledgers = await Promise.all(
    accounts.map(async (acct) => {
      const { totalDebit, totalCredit } = await totalsForAccount(acct.id);
      // Normal balance: assets/expenses are debit-normal, the rest credit-normal.
      const balance =
        acct.type === "ASSET" || acct.type === "EXPENSE"
          ? totalDebit - totalCredit
          : totalCredit - totalDebit;
      return {
        id: acct.id,
        code: acct.code,
        name: acct.name,
        type: acct.type,
        totalDebit,
        totalCredit,
        balance,
      } satisfies T_LEDGER;
    }),
  );
  return {
    ...accountsRes,
    data: {
      data: ledgers,
      pagination: accountsRes.data.pagination,
    },
  };
}
