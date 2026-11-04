import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ReactNode } from "react";

import { listBatches, moveBatchToNextTerm, listTerms, createBatch, updateBatch, deleteBatch } from "./service/service";
import BatchFormDialog from "./form/batch-form";
import type { T_BATCH } from "./service/service";

export default function AcademicStructurePage() {
  const [tab, setTab] = useState<"batches" | "terms" | "subjects">("batches");
  return (
    <div className="p-5">
      <PageHeader
        title="Academic Structure"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Academic Structure", link: "/admin/batches" }]}
      />
      <div className="flex flex-wrap gap-1 mb-4">
        {([["batches", "Batches"], ["terms", "Terms"], ["subjects", "Subjects"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded px-3 py-1 text-sm font-medium ${tab === k ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {l}
          </button>
        ))}
      </div>
      {tab === "batches" && <BatchesView />}
      {tab === "terms" && <TermsView />}
      {tab === "subjects" && <SubjectsView />}
    </div>
  );
}

function BatchesView() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const deleteId = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, search, page],
    queryFn: () => listBatches({ page, limit: 10, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_BATCH[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  const moveMut = useMutation({
    mutationFn: ({ batchId, nextTermNumber }: { batchId: string; nextTermNumber: number }) =>
      moveBatchToNextTerm(batchId, nextTermNumber),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST] }); },
  });

  const head: T_TableHead<T_BATCH>[] = [
    { key: "id", headName: "ID", minWidth: 120 },
    { key: "name", headName: "Name", minWidth: 220 },
    { key: "currentTermNumber", headName: "Current Term", minWidth: 160, render: (b) => `#${b.currentTermNumber}` },
    { key: "isActive", headName: "Status", minWidth: 100, render: (b) => <Badge variant={b.isActive ? "default" : "destructive"}>{b.isActive ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>New Batch</Button>
      </div>
      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(b) => `/admin/batches?mode=edit&id=${b.id}`}
        onDelete={(b) => { /* delete TODO */ }}
        onSearch={setSearch}
        emptyTitle="No batches."
        pagination={{ page, limit: 10, total, onPageChange: setPage }}
        searchPlaceholder="Search batches..."
      />
      {createOpen && <BatchFormDialog mode="create" onClose={() => setCreateOpen(false)} />}
      {editId && <BatchFormDialog mode="edit" batchId={editId} onClose={() => setEditId(null)} initial={rows.find((r) => r.id === editId)!} />}
    </div>
  );
}

function TermsView() {
  const [batchId, setBatchId] = useState("");
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TERM_LIST, batchId],
    queryFn: () => listTerms(batchId || undefined),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const head: T_TableHead<{ id: string; termNumber: number; name: string; startDateBs?: string; endDateBs?: string }>[] = [
    { key: "termNumber", headName: "#", minWidth: 60 },
    { key: "name", headName: "Name", minWidth: 200 },
    { key: "startDateBs", headName: "Start Date", minWidth: 180 },
    { key: "endDateBs", headName: "End Date", minWidth: 180 },
  ];

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Input placeholder="Filter by batch..." value={batchId} onChange={(e) => setBatchId(e.target.value)} />
        <span className="self-center text-xs text-muted-foreground">Select a batch to list its terms.</span>
      </div>
      <GenericTable
        tableHeads={head}
        data={query.data?.data ?? []}
        emptyTitle="No terms for this batch."
        pagination={{ page: 1, limit: 10, total: query.data?.data?.length ?? 0, onPageChange: () => {} }}
      />
    </div>
  );
}

function SubjectsView() {
  // Subject list comes from term's subject list (filter by batch)
  const [batchId, setBatchId] = useState("");
  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SUBJECT_LIST, batchId],
    queryFn: () => listTerms() as never,
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const head: T_TableHead<{ code?: string; name: string; creditHours?: number; termNumber?: number }>[] = [
    { key: "code", headName: "Code", minWidth: 180 },
    { key: "name", headName: "Name", minWidth: 260 },
    { key: "creditHours", headName: "Credit Hours", minWidth: 140 },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button>New Subject</Button>
      </div>
      <GenericTable
        tableHeads={head}
        data={query.data?.data ?? []}
        emptyTitle="No subjects."
        pagination={{ page: 1, limit: 10, total: query.data?.data?.length ?? 0, onPageChange: () => {} }}
      />
    </div>
  );
}