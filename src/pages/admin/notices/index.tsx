import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import QUERY_KEYS from "@/lib/query-keys";
import type { T_NOTICE } from "./service/service";

import { listNotices, createNotice, publishNotice } from "./service/service";
import NewNoticeDialog from "./dialog/notice-dialog";

const LIMIT = 10;

export default function AdminNoticesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [publishId, setPublishId] = useState<string | null>(null);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_NOTICE_LIST, search, page],
    queryFn: () => listNotices({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_NOTICE[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const head: T_TableHead<T_NOTICE>[] = [
    { key: "title", headName: "Title", minWidth: 260 },
    { key: "content", headName: "Content", minWidth: 400 },
    { key: "published", headName: "Status", minWidth: 120, render: (n) => <Badge variant={n.published ? "success" : "warning"}>{n.published ? "Published" : "Draft"}</Badge> },
    { key: "createdAt", headName: "Created At", minWidth: 180 },
  ];

  const publishMut = useMutation({
    mutationFn: ({ id }: { id: string }) => publishNotice(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_NOTICE_LIST] }); setPublishId(null); toast.success("Notice published"); },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Notices"
        breadCrumbItems={[{ title: "Admin", link: "/admin" }, { title: "Notices", link: "/admin/notices" }]}
        createPage="/admin/notices?mode=create"
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search notices..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>New Notice</Button>
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={setSearch}
        emptyTitle="No notices found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search notices..."
        renderRow={(n) => ({ content: n.content, published: n.published, createdAt: n.createdAt } as Record<string, import("@/components/ui/badge").BadgeVariant>)}
      />

      {publishId && (
        <ConfirmPublishDialog id={publishId} onClose={() => setPublishId(null)} onCancel={() => setPublishId(null)} onSuccess={() => {}} />
      )}

      {createOpen && <NewNoticeDialog mode="create" onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

function ConfirmPublishDialog({ id, onClose, onCancel, onSuccess }: { id: string; onClose: () => void; onCancel: () => void; onSuccess: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg border p-6 space-y-3">
        <h3 className="font-semibold">Publish Notice?</h3>
        <p className="text-sm text-muted-foreground">Publishing makes this notice visible to all roles.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" size="sm" disabled={true} onClick={() => { onSuccess(); onClose(); }}>Publish</Button>
        </div>
      </div>
    </div>
  );
}

import { toast } from "sonner";
