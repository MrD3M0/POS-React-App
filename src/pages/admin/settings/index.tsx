import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { ReactNode } from "react";

import { listSettings, createSetting, updateSetting, deleteSetting } from "./service/service";
import type { T_SETTING } from "./service/service";

export default function AdminSettingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SETTING_ALL, search, page],
    queryFn: () => listSettings({ page, limit: 10, search }),
  });

  if (listQuery.isLoading) return <ScreenLoader />;
  if (listQuery.isError) return <AlertHandler variant="error" />;

  const rows: T_SETTING[] = listQuery.data?.data?.data ?? [];
  const total = listQuery.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  const tableHeads: T_TableHead<T_SETTING>[] = [
    { key: "key", headName: "Key", minWidth: 200 },
    { key: "value", headName: "Value", minWidth: 300 },
    { key: "description", headName: "Description", minWidth: 250 },
    {
      key: "actions",
      headName: "",
      render: () => <span className="text-xs uppercase text-muted-foreground">Actions</span>,
    },
  ];

  return (
    <div className="p-5">
      <PageHeader title="Settings" breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Settings", link: "/admin/settings" }]} />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search settings..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => console.log("create", {})}>New Setting</Button>
      </div>
      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onEdit={(s) => `/admin/settings?id=${s.id}`}
        onDelete={(s) => setDeleteId(s.id)}
        onSearch={setSearch}
        emptyTitle="No settings found."
        renderRow={(s) => ({ value: s.value ?? "—" } as Record<string, ReactNode>)}
        pagination={{ page, limit: 10, total, onPageChange: setPage }}
        searchPlaceholder="Search settings..."
      />
      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          itemId={deleteId}
          onDelete={deleteSetting}
          itemName="Setting"
        />
      )}
    </div>
  );
}
