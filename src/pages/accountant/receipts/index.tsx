import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";
import ConfirmDeleteDialog from "@/components/dialog/confirm-delete";

const LIMIT = 20;

export default function AccountantReceiptsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const qc = useQueryClient();

  // Receipt list — READ is required for all roles
  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_RECEIPTS, search, page],
    queryFn: () => ({ receiptsUrl: "/accountant/receipts" }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_RECEIPT[] = query.data?.data?.data ?? [];

  const cancelMut = useMutation({
    mutationFn: ({ receiptId, reason }) => cancelReceipt(receiptId, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_RECEIPTS] }); setCancelId(null); toast.success("Receipt reversed"); },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Payments & Receipts"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Payments & Receipts", link: "/accountant/receipts" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search receipts..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <GenericTable
        tableHeads={[
          { key: "receiptNo", headName: "Receipt No.", minWidth: 200 },
          { key: "studentName", headName: "Student", minWidth: 200 },
          { key: "totalAmount", headName: "Total ( NPR )", minWidth: 160 },
          { key: "createdAt", headName: "Created At", minWidth: 180 },
          { key: "status", headName: "Status", minWidth: 120, render: (r) => <Badge variant={r.status === "CANCELLED" ? "destructive" : "default"}>{r.status}</Badge> },
        ]}
        data={rows}
        emptyTitle="No receipts found."
        pagination={{ page, limit: LIMIT, total: 0, onPageChange: setPage }}
        searchPlaceholder="Search receipts..."
      />

      {cancelId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setCancelId(null)}
          itemId={cancelId}
          itemName="Receipt"
          onDelete={async (id) => { await cancelReceipt(id!, "Cancelled by user"); toast.success("Reversal entry created"); setCancelId(null); }}
        />
      )}
    </div>
  );
}

type T_RECEIPT = {
  id: string;
  receiptNo: string;
  studentName: string;
  totalAmount: number;
  status: "VALID" | "CANCELLED";
  createdAt?: string;
};

async function cancelReceipt(receiptId: string, reason: string) {
  await fetch(`/accountant/receipts/${receiptId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` },
    body: JSON.stringify({ reason }),
  });
}
