import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listTeacherNotices, type T_NOTICE } from "./service/service";

const LIMIT = 20;

function toRows(raw: unknown): { rows: T_NOTICE[]; total: number } {
  const r = raw as { data?: T_NOTICE[] | { data?: T_NOTICE[]; pagination?: { total?: number } } };
  const rows: T_NOTICE[] = Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
  const total: number = Number(!Array.isArray(r?.data) ? r?.data?.pagination?.total : undefined) || rows.length;
  return { rows, total };
}

export default function TeacherNoticesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_NOTICES, page, search],
    queryFn: () => listTeacherNotices({ page, limit: LIMIT, search, role: "TEACHER" }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const { rows, total } = toRows(query.data);
  const published = rows.filter((n) => n.isPublished ?? n.published ?? false);

  const head: T_TableHead<T_NOTICE>[] = [
    { key: "title", headName: "Title", minWidth: 220, render: (n) => n.title ?? "—" },
    {
      key: "body",
      headName: "Content",
      minWidth: 300,
      render: (n) => {
        const text = n.body ?? n.content ?? "";
        return text.length > 120 ? `${text.slice(0, 120)}...` : text || "—";
      },
    },
    {
      key: "isPinned",
      headName: "Pinned",
      minWidth: 100,
      render: (n) => (n.isPinned ? <Badge variant="secondary">Pinned</Badge> : "—"),
    },
    {
      key: "createdAt",
      headName: "Published At",
      minWidth: 140,
      render: (n) => (n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "—"),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Notices"
        breadCrumbItems={[{ title: "Teacher", link: "/teacher" }, { title: "Notices", link: "/teacher/notices" }]}
      />
      <GenericTable
        tableHeads={head}
        data={published}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search notices..."
        emptyTitle="No published notices."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
      />
    </div>
  );
}
