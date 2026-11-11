import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listAuditLogs, type T_AUDIT_LOG } from "./service/service";

const LIMIT = 15;

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_AUDIT_LOG, search, page],
    queryFn: () => listAuditLogs({ page, limit: LIMIT, search: search || undefined }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_AUDIT_LOG[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_AUDIT_LOG>[] = [
    { key: "action", headName: "Action", minWidth: 160 },
    { key: "entity", headName: "Entity", minWidth: 140 },
    { key: "entityId", headName: "Entity ID", minWidth: 220 },
    {
      key: "actor",
      headName: "Actor",
      minWidth: 220,
      render: (row) => row.user?.email ?? row.userId ?? "—",
    },
    {
      key: "createdAt",
      headName: "Time",
      minWidth: 200,
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Audit log"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Audit log", link: "/admin/audit" },
        ]}
      />
      <p className="text-sm text-muted-foreground mb-4">
        Read-only security and admin activity trail. Entries cannot be edited or deleted.
      </p>
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        emptyTitle="No audit log entries found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search entity, action, or entity ID..."
      />
    </div>
  );
}
