import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable from "@/components/generic-table";
import Button from "@/components/ui/button";
import QUERY_KEYS from "@/lib/query-keys";
import { listJournalEntries } from "./service/service";
import JournalEntryDialog from "./form/journal-entry-form";
import { useState } from "react";

const LIMIT = 20;

export default function AccountantJournalPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_JOURNAL, page],
    queryFn: () => listJournalEntries({ page, limit: LIMIT }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_JOURNAL_ENTRY[] = query.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader
        title="Journal Entries"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Journal Entries", link: "/accountant/journal" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <span className="text-xs text-muted-foreground">Closed FY blocks payments & journal entries.</span>
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>New Journal Entry</Button>
      </div>

      <GenericTable
        tableHeads={[
          { key: "description", headName: "Description", minWidth: 300 },
          { key: "debitTotal", headName: "Debit Total", minWidth: 140 },
          { key: "creditTotal", headName: "Credit Total", minWidth: 140 },
          { key: "balance", headName: "Balance", minWidth: 140 },
          { key: "groupAccount", headName: "Group Account", minWidth: 180, render: (j: T_JOURNAL_ENTRY) => <Badge variant="outline">{j.groupAccount ?? "—"}</Badge> },
          { key: "dateBs", headName: "Date (BS)", minWidth: 180 },
        ]}
        data={rows}
        emptyTitle="No journal entries."
        pagination={{ page, limit: LIMIT, total: query.data?.data?.pagination?.total ?? 0, onPageChange: setPage }}
        renderRow={(j: T_JOURNAL_ENTRY) => ({
          description: j.description, debitTotal: j.debitTotal, creditTotal: j.creditTotal, balance: j.balance ?? "0", groupAccount: j.groupAccount ?? "",
        } as Record<string, React.ReactNode>)}
      />

      {createOpen && <JournalEntryDialog onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

type T_JOURNAL_ENTRY = {
  id: string;
  description: string;
  debitTotal: number;
  creditTotal: number;
  balance?: number;
  groupAccount?: boolean;
  dateBs?: string;
};