import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";
import { isClosed } from "@/pages/admin/fiscal-years/service/service"; // wait — separate accountant fiscal year check
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import JournalEntryDialog from "./form/journal-entry-form";

const LIMIT = 20;

export default function AccountantJournalPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [closedFYId, setClosedFYId] = useState<string | null>(null);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_JOURNAL, page],
    queryFn: () => ({ journalUrl: "/accountant/journal" }),
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
          { key: "groupAccount", headName: "Group Account", minWidth: 180, render: (j) => <Badge variant="outline">{j.groupAccount ?? "—"}</Badge> },
          { key: "dateBs", headName: "Date (BS)", minWidth: 180 },
        ]}
        data={rows}
        emptyTitle="No journal entries."
        pagination={{ page, limit: LIMIT, total: 0, onPageChange: setPage }}
        renderRow={(j) => ({ description: j.description, debitTotal: j.debitTotal, creditTotal: j.creditTotal, balance: j.balance ?? "0", groupAccount: j.groupAccount ?? "" } as Record<string, React.ReactNode>)}
      />

      {closedFYId && (
        <ConfirmDeleteDialog open onOpenChange={(o) => !o && setClosedFYId(null)} itemId={closedFYId} itemName="Fiscal Year" onDelete={async () => { void isClosed({ fiscalYearId: closedFYId! }); setClosedFYId(null); }} />
      )}

      {createOpen && <JournalEntryForm onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

type T_JOURNAL_ENTRY = {
  id: string;
  description: string;
  debitTotal: number;
  creditTotal: number;
  balance?: number;
  groupAccount?: boolean; // true if a group account — cannot post to these
  dateBs?: string;
};
