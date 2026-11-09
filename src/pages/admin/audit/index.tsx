import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";

import { listAuditLogs } from "./service/service";

const LIMIT = 10;

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_AUDIT_LOG, search, page],
    queryFn: () => listAuditLogs({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_AUDIT_LOG[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_AUDIT_LOG>[] = [
    { key: "action", headName: "Action", minWidth: 200 },
    { key: "entity", headName: "Entity", minWidth: 180 },
    { key: "entityId", headName: "Entity ID", minWidth: 200 },
    { key: "actorId", headName: "Actor", minWidth: 200 },
    { key: "createdAt", headName: "Time", minWidth: 180 },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Audit Log"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Audit Log", link: "/admin/audit" },
        ]}
      />
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No audit log entries found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search audit log..."
      />
    </div>
  );
}

type T_AUDIT_LOG = {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  actorId?: string;
  details?: string;
  createdAt?: string;
};
