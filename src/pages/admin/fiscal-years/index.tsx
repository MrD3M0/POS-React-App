import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listFiscalYears, deleteFiscalYear, type T_FY } from "./service/service";

const LIMIT = 10;

export default function AdminFiscalYearsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FISCALYEAR_LIST, search, page],
    queryFn: () => listFiscalYears({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_FY[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_FY>[] = [
    { key: "name", headName: "Fiscal Year" },
    { key: "startDateBs", headName: "Start Date (BS)" },
    { key: "endDateBs", headName: "End Date (BS)" },
    {
      key: "isCurrent",
      headName: "Current",
      render: (f) => (f.isCurrent ? <Badge variant="default">Current</Badge> : <span className="text-muted-foreground">—</span>),
    },
    {
      key: "isClosed",
      headName: "Status",
      render: (f) => (
        <Badge variant={f.isClosed ? "destructive" : "outline"}>
          {f.isClosed ? "Closed" : "Open"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Fiscal Years"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Fiscal Years", link: "/admin/fiscal-years" }]}
        createPage="/admin/fiscal-years/create"
        createPageTitle="New Fiscal Year"
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onEdit={(f) => `/admin/fiscal-years/edit/${f.id}`}
        onDelete={(f) => setDeleteId(f.id)}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No fiscal years found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search fiscal years..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          itemId={deleteId}
          itemName="Fiscal Year"
          onDelete={deleteFiscalYear}
        />
      )}
    </div>
  );
}
