import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import { ActiveStatusBadge } from "@/components/ui/status-badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listBatches, deleteBatch, type T_BATCH } from "./service/service";

export default function AdminBatchesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, search, page],
    queryFn: () => listBatches({ page, limit: 10, search }),
  });

  const rows: T_BATCH[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const head: T_TableHead<T_BATCH>[] = [
    { key: "name", headName: "Batch Name" },
    {
      key: "courseId",
      headName: "Course",
      render: (b) => (b.course ? `${b.course.code} - ${b.course.name}` : b.courseId),
    },
    { key: "currentTermNumber", headName: "Current Term", render: (b) => `#${b.currentTermNumber}` },
    { key: "startDateBs", headName: "Start Date (BS)", render: (b) => b.startDateBs || "—" },
    {
      key: "isActive",
      headName: "Status",
      render: (b) => <ActiveStatusBadge active={b.isActive} />,
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Batches"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Batches", link: "/admin/batches" }]}
        createPage="/admin/batches/create"
        createPageTitle="New Batch"
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(b) => `/admin/batches/edit/${b.id}`}
        onDelete={(b) => setDeleteId(b.id)}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No batches found."
        pagination={{ page, limit: 10, total, onPageChange: setPage }}
        searchPlaceholder="Search batches..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          itemId={deleteId}
          itemName="Batch"
          onDelete={deleteBatch}
        />
      )}
    </div>
  );
}
