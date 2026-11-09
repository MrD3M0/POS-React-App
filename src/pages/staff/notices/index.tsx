import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listNotices, type T_NOTICE } from "./service/service";

const LIMIT = 20;

export default function StaffNoticesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.STAFF_ATTENDANCE, "notices", page, search],
    queryFn: () => listNotices({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_NOTICE[] = Array.isArray(query.data?.data?.data)
    ? query.data.data.data
    : Array.isArray(query.data?.data)
      ? query.data.data
      : [];
  const total = query.data?.data?.pagination?.total ?? rows.length;

  const head: T_TableHead<T_NOTICE>[] = [
    { key: "title", headName: "Title", minWidth: 220 },
    {
      key: "body",
      headName: "Content",
      minWidth: 320,
      render: (n) => (n.body && n.body.length > 80 ? `${n.body.slice(0, 80)}...` : n.body ?? "—"),
    },
    {
      key: "isPublished",
      headName: "Status",
      minWidth: 140,
      render: (n) => (
        <Badge variant={n.isPublished ? "default" : "outline"}>{n.isPublished ? "Published" : "Draft"}</Badge>
      ),
    },
    {
      key: "isPinned",
      headName: "Pinned",
      minWidth: 120,
      render: (n) => (n.isPinned ? <Badge variant="secondary">Pinned</Badge> : null),
    },
    { key: "createdAt", headName: "Created At", minWidth: 160, render: (n) => (n.createdAt ? n.createdAt.slice(0, 10) : "—") },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Notices"
        breadCrumbItems={[
          { title: "Staff", link: "/staff/notices" },
          { title: "Notices", link: "/staff/notices" },
        ]}
      />
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search notices..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No notices found."
        renderRow={(r) => ({ title: r.title, createdAt: r.createdAt ? r.createdAt.slice(0, 10) : "—" } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}
