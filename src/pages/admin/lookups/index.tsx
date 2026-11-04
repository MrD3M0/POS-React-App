import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import QUERY_KEYS from "@/lib/query-keys";
import type { ReactNode } from "react";

import { listLookups, createLookup, updateLookup, deleteLookup } from "./service/service";
import LookupFormDialog from "./dialog/lookup-form";

const LIMIT = 10;
const SECTIONS = ["Leave Types", "Exam Types", "Grade Scales", "Fee Heads", "Payment Methods", "Salary Components", "Chart Accounts"];

export default function AdminLookupsPage() {
  const [tab, setTab] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LOOKUP_LEAVE, search, page],
    queryFn: () => listLookups({ type: "leaveType", page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_LOOKUP[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const head: T_TableHead<T_LOOKUP>[] = [
    { key: "code", headName: "Code", minWidth: 160 },
    { key: "name", headName: "Name", minWidth: 240 },
    { key: "active", headName: "Status", minWidth: 100, render: (l) => <Badge variant={l.active ? "default" : "destructive"}>{l.active ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Lookups"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Lookups", link: "/admin/lookups" }]}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        {SECTIONS.map((s, i) => (
          <button key={s} onClick={() => setTab(i)} className={`rounded px-3 py-1 text-sm font-medium ${tab === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search lookups..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>New Lookup</Button>
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={setSearch}
        emptyTitle="No lookups found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search lookups..."
      />

      {createOpen && <LookupFormDialog type="leaveType" onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

type T_LOOKUP = {
  id: string;
  code: string;
  name: string;
  active?: boolean;
};

import { createLookup as crLookup, updateLookup as updLookup, deleteLookup as delLookup } from "./service/service";
void crLookup; void updLookup; void delLookup;
