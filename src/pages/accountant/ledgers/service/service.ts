import axiosInstance from "@/lib/axios-request";
import { UrlConstants } from "@/constants/endpoints";
import { normalizeListBody } from "@/pages/accountant/service-utils";

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

/** Per-account debit/credit totals — one grouped query for the whole page. */
export async function listJournalLineTotals() {
  const res = await axiosInstance.get(
    `${UrlConstants.JOURNAL_LINE_URL}/totals`,
  );
  const rows = (res.data?.data ?? []) as {
    accountId: string;
    totalDebit: number;
    totalCredit: number;
  }[];
  return new Map(
    rows.map((row) => [
      row.accountId,
      { totalDebit: row.totalDebit, totalCredit: row.totalCredit },
    ]),
  );
}

export async function listLedgers(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const [accountsRes, totals] = await Promise.all([
    listAccounts(params),
    listJournalLineTotals(),
  ]);
  const accounts = accountsRes.data.data;
  const ledgers = accounts.map((acct) => {
    const { totalDebit, totalCredit } =
      totals.get(acct.id) ?? { totalDebit: 0, totalCredit: 0 };
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
  });
  return {
    ...accountsRes,
    data: {
      data: ledgers,
      pagination: accountsRes.data.pagination,
    },
  };
}
