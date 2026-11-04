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
import QUERY_KEYS from "@/lib/query-keys";
import type { ReactNode } from "react";

import { listFiscalYears, createFiscalYear, updateFiscalYear, deleteFiscalYear, isClosed } from "./service/service";
import FiscalYearFormDialog from "./form/fiscal-year-form";

const LIMIT = 10;

export default function AdminFiscalYearsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FISCALYEAR_LIST, search, page],
    queryFn: () => listFiscalYears({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_FY[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const head: T_TableHead<T_FY>[] = [
    { key: "year", headName: "Year", minWidth: 100 },
    { key: "startDateBs", headName: "Start Date", minWidth: 180 },
    { key: "endDateBs", headName: "End Date", minWidth: 180 },
    { key: "status", headName: "Status", minWidth: 140, render: (f) => <Badge variant={f.closed ? "destructive" : "default"}>{f.closed ? "Closed" : "Open"}</Badge> },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Fiscal Years"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Fiscal Years", link: "/admin/fiscal-years" }]}
        createPage="/admin/fiscal-years?mode=create"
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search fiscal years..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>New Fiscal Year</Button>
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(f) => `/admin/fiscal-years?mode=edit&id=${f.id}`}
        onDelete={(f) => setDeleteId(f.id)}
        onSearch={setSearch}
        emptyTitle="No fiscal years found."
        renderRow={(f) => ({ status: f.closed ? <Badge variant="destructive">Closed</Badge> : <Badge variant="default">Open</Badge> } as Record<string, ReactNode>)}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search fiscal years..."
      />

      {createOpen && <FiscalYearFormDialog mode="create" onClose={() => setCreateOpen(false)} />}
      {editId && <FiscalYearFormDialog mode="edit" id={editId} onClose={() => setEditId(null)} initial={rows.find((r) => r.id === editId)!} />}
      {deleteId && <ConfirmDeleteDialog open onOpenChange={(o) => !o && setDeleteId(null)} itemId={deleteId} itemName="Fiscal Year" onDelete={deleteFiscalYear} />}
    </div>
  );
}

type T_FY = {
  id: string;
  year: string;
  startDateBs?: string;
  endDateBs?: string;
  closed: boolean;
};

import { isClosed as checkClosed } from "./service/service";
void checkClosed; // re-exported below
