import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listReceipts, cancelReceipt, type T_FEE_PAYMENT_RECEIPT } from "./service/service";

const LIMIT = 20;

type T_RECEIPT_ROW = {
  id: string;
  receiptNo: string;
  studentName: string;
  regNo: string;
  totalAmount: string;
  paymentDateBs: string;
  status: "VALID" | "CANCELLED";
  remarks: string;
};

function studentName(r: T_FEE_PAYMENT_RECEIPT): string {
  const s = r.student;
  if (!s) return "—";
  const name = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ").trim();
  return name || s.universityRegNo || "—";
}

export default function AccountantReceiptsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_RECEIPTS, search, page],
    queryFn: () => listReceipts({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const raw: T_FEE_PAYMENT_RECEIPT[] = query.data?.data?.data ?? [];
  const rows: T_RECEIPT_ROW[] = raw.map((r) => ({
    id: r.id,
    receiptNo: r.receiptNo ?? "—",
    studentName: studentName(r),
    regNo: r.student?.universityRegNo ?? "—",
    totalAmount: r.totalAmount != null ? String(r.totalAmount) : "—",
    paymentDateBs: r.paymentDateBs ?? r.createdAt?.slice(0, 10) ?? "—",
    status: r.isCancelled ? "CANCELLED" : "VALID",
    remarks: r.remarks ?? "",
  }));
  const total = query.data?.data?.pagination?.total ?? 0;

  const head: T_TableHead<T_RECEIPT_ROW>[] = [
    { key: "receiptNo", headName: "Receipt No.", minWidth: 180 },
    { key: "studentName", headName: "Student", minWidth: 200 },
    { key: "regNo", headName: "Reg. No.", minWidth: 150 },
    { key: "totalAmount", headName: "Total (NPR)", minWidth: 140 },
    { key: "paymentDateBs", headName: "Payment Date (BS)", minWidth: 160 },
    {
      key: "status",
      headName: "Status",
      minWidth: 120,
      render: (r) => <Badge variant={r.status === "CANCELLED" ? "destructive" : "default"}>{r.status}</Badge>,
    },
    {
      key: "action",
      headName: "Action",
      minWidth: 120,
      render: (r) =>
        r.status === "VALID" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setCancelId(r.id)}
            disabled={cancelling}
          >
            Cancel
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Payments & Receipts"
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Payments & Receipts", link: "/accountant/receipts" },
        ]}
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        emptyTitle="No receipts/payments found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search by receipt no., student reg no., remarks..."
      />

      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border bg-background p-6">
            <h3 className="font-semibold">Cancel Receipt/Payment</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This will reverse the payment via backend cancellation (append-only). Provide a reason for audit.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCancelId(null)} disabled={cancelling}>
                Close
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                loading={cancelling}
                onClick={async () => {
                  setCancelling(true);
                  try {
                    await cancelReceipt(cancelId, "Cancelled from accountant receipts page");
                    toast.success("Payment/receipt cancelled.");
                    qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_RECEIPTS] });
                    qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_PAYMENTS] });
                    setCancelId(null);
                  } catch (e: unknown) {
                    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
                    toast.error(msg ?? "Failed to cancel receipt/payment.");
                  } finally {
                    setCancelling(false);
                  }
                }}
              >
                Cancel Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
