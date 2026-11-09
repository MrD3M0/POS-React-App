import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { T_NOTICE } from "./service/service";
import { listNotices, deleteNotice } from "./service/service";

const LIMIT = 10;

export default function AdminNoticesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_NOTICE_LIST, search, page],
    queryFn: () => listNotices({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_NOTICE[] = query.data?.data?.data ?? query.data?.data ?? [];
  const total = query.data?.pagination?.total ?? query.data?.data?.pagination?.total ?? rows.length;

  const head: T_TableHead<T_NOTICE>[] = [
    { key: "title", headName: "Title" },
    {
      key: "body",
      headName: "Content",
      render: (n) => {
        const text = n.body ?? n.content ?? "";
        return text.length > 80 ? `${text.slice(0, 80)}...` : text || "—";
      },
    },
    {
      key: "isPublished",
      headName: "Status",
      render: (n) => {
        const pub = n.isPublished ?? n.published ?? false;
        return (
          <Badge variant={pub ? "default" : "outline"}>
            {pub ? "Published" : "Draft"}
          </Badge>
        );
      },
    },
    {
      key: "isPinned",
      headName: "Pinned",
      render: (n) => (n.isPinned ? <Badge variant="secondary">Pinned</Badge> : null),
    },
    {
      key: "createdAt",
      headName: "Created At",
      render: (n) => (n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "—"),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Notices"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Notices", link: "/admin/notices" }]}
        createPage="/admin/notices/create"
        createPageTitle="New Notice"
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(n) => `/admin/notices/edit/${n.id}`}
        onDelete={(n) => setDeleteId(n.id)}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No notices found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search notices..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Notice"
          onDelete={deleteNotice}
        />
      )}
    </div>
  );
}
