import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listTerms, deleteTerm, type T_TERM } from "./service/service";

const LIMIT = 10;

export default function AdminTermsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TERM_LIST, search, page],
    queryFn: () => listTerms({ page, limit: LIMIT, search }),
  });

  const rows: T_TERM[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const head: T_TableHead<T_TERM>[] = [
    { key: "termNumber", headName: "#", render: (t) => `#${t.termNumber}` },
    { key: "name", headName: "Name", render: (t) => (
      <Link
        to={`/admin/terms/${t.id}/subjects`}
        className="font-medium text-primary hover:underline"
      >
        {t.name}
      </Link>
    ) },
    { key: "batchId", headName: "Batch ID" },
    { key: "startDateBs", headName: "Start Date (BS)", render: (t) => t.startDateBs || "—" },
    { key: "endDateBs", headName: "End Date (BS)", render: (t) => t.endDateBs || "—" },
    {
      key: "isActive",
      headName: "Status",
      render: (t) => (
        <Badge variant={t.isActive ? "default" : "destructive"}>{t.isActive ? "Active" : "Inactive"}</Badge>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Terms"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Terms", link: "/admin/terms" }]}
        createPage="/admin/terms/create"
        createPageTitle="New Term"
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(t) => `/admin/terms/edit/${t.id}`}
        onDelete={(t) => setDeleteId(t.id)}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No terms found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search terms..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(open) => !open && setDeleteId(null)}
          itemId={deleteId}
          itemName="Term"
          onDelete={deleteTerm}
        />
      )}
    </div>
  );
}
