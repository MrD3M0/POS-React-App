import { useQuery } from "@tanstack/react-query";
import { listAccounts } from "@/pages/accountant/service-utils";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";

import GenericTable from "@/components/generic-table";
import Input from "@/components/ui/input";

import QUERY_KEYS from "@/lib/query-keys";
import { useState } from "react";

const LIMIT = 20;

export default function AccountantLedgersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_LEDGERS, search, page],
    queryFn: async () => {
      try {
        const res = await listAccounts({ page, limit: LIMIT, search });
        const ledgers = res.data?.data?.map((acct: any) => ({
          id: acct.id,
          ledgerName: acct.name,
          totalDebit: 0,
          totalCredit: 0,
          balance: acct.isGroup ? 0 : (acct.type === "LIABILITY" ? Math.abs(acct.balance ?? 0) : 0),
        })) ?? [];
        return { data: { data: { data: ledgers }, pagination: { page, limit: LIMIT, total: ledgers.length } } };
      } catch {
        return { data: { data: { data: [] }, pagination: { page, limit: LIMIT, total: 0 } } };
      }
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_LEDGER[] = query.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader
        title="Ledgers"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Ledgers", link: "/accountant/ledgers" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search ledgers..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <span className="self-center text-xs text-muted-foreground">Account ledgers.</span>
      </div>

      <GenericTable
        tableHeads={[
          { key: "ledgerName", headName: "Ledger", minWidth: 240 },
          { key: "totalDebit", headName: "Total Debit", minWidth: 160 },
          { key: "totalCredit", headName: "Total Credit", minWidth: 160 },
          { key: "balance", headName: "Balance", minWidth: 160 },
        ]}
        data={rows}
        emptyTitle="No ledger entries."
        pagination={{ page, limit: LIMIT, total: query.data?.data?.pagination?.total ?? 0, onPageChange: setPage }}
        searchPlaceholder="Search ledgers..."
      />
    </div>
  );
}

type T_LEDGER = {
  id: string;
  ledgerName: string;
  totalDebit: number;
  totalCredit: number;
  balance?: number;
};