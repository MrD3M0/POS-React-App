import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable from "@/components/generic-table";
import Input from "@/components/ui/input";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listLedgers, type T_LEDGER } from "./service/service";
import { useState } from "react";

const LIMIT = 20;

export default function AccountantLedgersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_LEDGERS, search, page],
    queryFn: () => listLedgers({ page, limit: LIMIT, search }),
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
        <span className="self-center text-xs text-muted-foreground">Account ledgers with live journal-line totals.</span>
      </div>

      <GenericTable
        tableHeads={[
          { key: "code", headName: "Code", minWidth: 140 },
          { key: "name", headName: "Ledger", minWidth: 240 },
          { key: "type", headName: "Type", minWidth: 140, render: (l: T_LEDGER) => <Badge variant="outline">{l.type}</Badge> },
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
