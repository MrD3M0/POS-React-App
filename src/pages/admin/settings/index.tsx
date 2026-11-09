import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listSettings, deleteSetting, type T_SETTING } from "./service/service";

const LIMIT = 10;

export default function AdminSettingsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SETTING_ALL, search, page],
    queryFn: () => listSettings({ page, limit: LIMIT, search }),
  });

  const rows: T_SETTING[] = listQuery.data?.data?.data ?? [];
  const total = listQuery.data?.data?.pagination?.total ?? 0;

  if (listQuery.isLoading) return <ScreenLoader />;
  if (listQuery.isError) return <AlertHandler variant="error" />;

  const tableHeads: T_TableHead<T_SETTING>[] = [
    { key: "key", headName: "Key" },
    { key: "value", headName: "Value" },
    { key: "description", headName: "Description" },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Settings"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Settings", link: "/admin/settings" }]}
        createPage="/admin/settings/create"
        createPageTitle="New Setting"
      />
      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onEdit={(s) => `/admin/settings/edit/${s.id ?? s.key}`}
        onDelete={(s) => setDeleteId(s.id ?? null)}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No settings found."
        renderRow={(s) => ({ value: s.value ?? "—", description: s.description ?? "—" })}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
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
