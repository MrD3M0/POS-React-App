import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listNotices, toggleNoticePublished, type T_NOTICE } from "./service/service";

const LIMIT = 20;

export default function PrincipalNoticesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "notices", page, search],
    queryFn: () => listNotices({ page, limit: LIMIT, search }),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => toggleNoticePublished(id, isPublished),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_REPORTS, "notices"] });
      toast.success(vars.isPublished ? "Notice published" : "Notice unpublished");
    },
    onError: () => toast.error("Failed to update notice."),
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
      minWidth: 300,
      render: (n) => {
        const text = n.body ?? n.content ?? "";
        return text.length > 80 ? `${text.slice(0, 80)}...` : text || "—";
      },
    },
    {
      key: "isPublished",
      headName: "Status",
      minWidth: 140,
      render: (n) => (
        <Badge variant={n.isPublished ? "default" : "outline"}>{n.isPublished ? "Published" : "Draft"}</Badge>
      ),
    },
    { key: "createdAt", headName: "Created At", minWidth: 160, render: (n) => (n.createdAt ? n.createdAt.slice(0, 10) : "—") },
    {
      key: "action",
      headName: "Action",
      minWidth: 170,
      render: (n) => (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={toggleMut.isPending}
          onClick={() => toggleMut.mutate({ id: n.id, isPublished: !n.isPublished })}
        >
          {n.isPublished ? "Unpublish" : "Publish"}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Notices"
        breadCrumbItems={[
          { title: "Principal", link: "/principal/notices" },
          { title: "Notices", link: "/principal/notices" },
        ]}
        createPage="/principal/notices/create"
        createPageTitle="New Notice"
      />
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search notices..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No notices found."
        renderRow={(n) => ({
          title: n.title,
          createdAt: n.createdAt ? n.createdAt.slice(0, 10) : "—",
        } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}
