import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import QUERY_KEYS from "@/lib/query-keys";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { toast } from "sonner";

const LIMIT = 20;

export default function AccountantLedgersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_LEDGERS, search, page],
    queryFn: () => ({ ledgersUrl: "/accountant/ledgers" }),
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
        <span className="self-center text-xs text-muted-foreground">Student, Employee, Account ledgers.</span>
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
        pagination={{ page, limit: LIMIT, total: 0, onPageChange: setPage }}
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
