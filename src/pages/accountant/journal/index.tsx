import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable from "@/components/generic-table";
import Button from "@/components/ui/button";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listJournalEntries, type T_JOURNAL_ENTRY } from "./service/service";
import JournalEntryDialog from "./form/journal-entry-form";

const LIMIT = 20;

function toNum(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function totals(entry: T_JOURNAL_ENTRY) {
  if (typeof entry.debitTotal === "number" || typeof entry.creditTotal === "number") {
    const debit = toNum(entry.debitTotal);
    const credit = toNum(entry.creditTotal);
    return { debit, credit, balance: toNum(entry.balance ?? debit - credit) };
  }
  const lines = entry.lines ?? [];
  const debit = lines.reduce((s, l) => s + toNum(l.debit ?? (l.direction === "DEBIT" ? l.amount : 0)), 0);
  const credit = lines.reduce((s, l) => s + toNum(l.credit ?? (l.direction === "CREDIT" ? l.amount : 0)), 0);
  return { debit, credit, balance: debit - credit };
}

export default function AccountantJournalPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_JOURNAL, page],
    queryFn: () => listJournalEntries({ page, limit: LIMIT }),
  });

  const rows = useMemo(() => query.data?.data?.data ?? [], [query.data]);

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Journal Entries"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Journal Entries", link: "/accountant/journal" }]}
      />
      <div className="mb-4 flex w-full max-w-4xl flex-wrap items-center gap-3">
        <span className="text-xs text-muted-foreground">Closed FY blocks payments & journal entries.</span>
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>New Journal Entry</Button>
      </div>

      <GenericTable
        tableHeads={[
          { key: "entryNo", headName: "Entry No.", minWidth: 140, render: (j: T_JOURNAL_ENTRY) => j.entryNo ?? "—" },
          { key: "description", headName: "Description", minWidth: 280 },
          { key: "debitTotal", headName: "Debit Total", minWidth: 130, render: (j: T_JOURNAL_ENTRY) => totals(j).debit.toFixed(2) },
          { key: "creditTotal", headName: "Credit Total", minWidth: 130, render: (j: T_JOURNAL_ENTRY) => totals(j).credit.toFixed(2) },
          { key: "balance", headName: "Balance", minWidth: 120, render: (j: T_JOURNAL_ENTRY) => totals(j).balance.toFixed(2) },
          { key: "source", headName: "Source", minWidth: 120, render: (j: T_JOURNAL_ENTRY) => <Badge variant="outline">{j.source ?? "—"}</Badge> },
          { key: "dateBs", headName: "Date (BS)", minWidth: 140, render: (j: T_JOURNAL_ENTRY) => j.dateBs ?? "—" },
        ]}
        data={rows}
        emptyTitle="No journal entries."
        pagination={{ page, limit: LIMIT, total: query.data?.data?.pagination?.total ?? 0, onPageChange: setPage }}
      />

      {createOpen && <JournalEntryDialog onClose={() => setCreateOpen(false)} />}
    </div>
  );
}
