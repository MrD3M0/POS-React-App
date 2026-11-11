import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import GenericTable from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  cancelFeePayment,
  listFeePayments,
  studentFullName,
  type T_FeePayment,
} from "./service/service";

const LIMIT = 20;

function rowsFromList(data: unknown): { rows: unknown[]; total: number } {
  const raw = data as { data?: unknown; pagination?: { total?: number } };
  if (Array.isArray(raw?.data)) return { rows: raw.data, total: raw?.pagination?.total ?? raw.data.length };
  const nested = raw?.data as { data?: unknown[]; pagination?: { total?: number } } | undefined;
  if (nested && Array.isArray(nested.data)) return { rows: nested.data, total: nested?.pagination?.total ?? nested.data.length };
  return { rows: [], total: 0 };
}

/** Fee Payments — the receipts of the college (money received). */
export default function AccountantFeePaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [cancelId, setCancelId] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING_PAYMENTS, search, page],
    queryFn: () => listFeePayments({ page, limit: LIMIT, search }),
  });

  const payments = useMemo(
    () => rowsFromList(query.data).rows as T_FeePayment[],
    [query.data],
  );

  const cancelMutation = useMutation({
    mutationFn: () =>
      cancelFeePayment(cancelId, cancelReason.trim() || "Cancelled by accountant"),
    onSuccess: () => {
      toast.success("Payment cancelled.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING_PAYMENTS] });
      setCancelId("");
      setCancelReason("");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to cancel payment.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Fee Payments"
        description="Every receipt of the college. A payment is cancelled by a reversal, never deleted."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant/dashboard" },
          { title: "Fee Payments", link: "/accountant/billing/payments" },
        ]}
        actions={
          <Button asChild size="sm">
            <Link to="/accountant/billing/record">Record Payment</Link>
          </Button>
        }
      />

      <GenericTable
        tableHeads={[
          { key: "receiptNo", headName: "Receipt No.", minWidth: 160 },
          {
            key: "student",
            headName: "Student",
            minWidth: 200,
            render: (p: T_FeePayment) => studentFullName(p.student),
          },
          {
            key: "total",
            headName: "Total",
            minWidth: 120,
            render: (p: T_FeePayment) => `Rs. ${Number(p.totalAmount).toFixed(2)}`,
          },
          {
            key: "date",
            headName: "Date (BS)",
            minWidth: 120,
            render: (p: T_FeePayment) => p.paymentDateBs,
          },
          {
            key: "status",
            headName: "Status",
            minWidth: 110,
            render: (p: T_FeePayment) => (
              <Badge variant={p.isCancelled ? "destructive" : "default"}>
                {p.isCancelled ? "CANCELLED" : "VALID"}
              </Badge>
            ),
          },
        ]}
        data={payments}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search receipt / student..."
        emptyTitle="No payment."
        pagination={{
          page,
          limit: LIMIT,
          total: rowsFromList(query.data).total,
          onPageChange: setPage,
        }}
        renderActions={(p: T_FeePayment) => (
          <span className="flex items-center justify-end gap-2">
            <Link
              to={`/accountant/billing/receipt/${p.id}`}
              className="text-xs font-medium text-primary underline"
            >
              Receipt
            </Link>
            {!p.isCancelled ? (
              <button
                type="button"
                className="text-xs font-medium text-destructive underline"
                onClick={() => setCancelId(p.id)}
              >
                Cancel
              </button>
            ) : null}
          </span>
        )}
      />

      {cancelId ? (
        <div className="mt-4 border border-border p-3">
          <label className="mb-1 block text-xs font-medium" htmlFor="cancel-reason">
            Cancel reason *
          </label>
          <Input
            id="cancel-reason"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Reason for cancellation"
          />
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={!cancelReason.trim() || cancelMutation.isPending}
              loading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              Confirm Cancel
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCancelId("")}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
