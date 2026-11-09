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
  listStudentFees,
  listFeePayments,
  listInstallments,
  cancelFeePayment,
  studentFullName,
  studentFeeNetTotal,
  dueItemsCount,
  type T_StudentFee,
  type T_FeePayment,
  type T_Installment,
} from "./service/service";
import RecordPaymentForm from "./components/record-payment-form";

const LIMIT = 10;

function rowsFromList(data: unknown): { rows: unknown[]; total: number } {
  const raw = data as { data?: unknown; pagination?: { total?: number } };
  if (Array.isArray(raw?.data)) return { rows: raw.data, total: raw?.pagination?.total ?? raw.data.length };
  const nested = raw?.data as { data?: unknown[]; pagination?: { total?: number } } | undefined;
  if (nested && Array.isArray(nested.data)) return { rows: nested.data, total: nested?.pagination?.total ?? nested.data.length };
  return { rows: [], total: 0 };
}

export default function AccountantBillingPage() {
  const qc = useQueryClient();

  const [feePage, setFeePage] = useState(1);
  const [feeSearch, setFeeSearch] = useState("");
  const [payPage, setPayPage] = useState(1);
  const [paySearch, setPaySearch] = useState("");
  const [instPage, setInstPage] = useState(1);
  const [instItemId, setInstItemId] = useState("");
  const [cancelId, setCancelId] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const feeQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING, feeSearch, feePage],
    queryFn: () => listStudentFees({ page: feePage, limit: LIMIT, search: feeSearch }),
  });

  const paymentsQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING_PAYMENTS, paySearch, payPage],
    queryFn: () => listFeePayments({ page: payPage, limit: LIMIT, search: paySearch }),
  });

  const installmentsQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING_INSTALLMENTS, instItemId, instPage],
    queryFn: () =>
      listInstallments({
        page: instPage,
        limit: LIMIT,
        ...(instItemId ? { studentFeeItemId: instItemId } : {}),
      }),
  });

  const fees = useMemo(() => rowsFromList(feeQuery.data).rows as T_StudentFee[], [feeQuery.data]);
  const payments = useMemo(() => rowsFromList(paymentsQuery.data).rows as T_FeePayment[], [paymentsQuery.data]);
  const installments = useMemo(() => rowsFromList(installmentsQuery.data).rows as T_Installment[], [installmentsQuery.data]);

  const cancelMutation = useMutation({
    mutationFn: () => cancelFeePayment(cancelId, cancelReason.trim() || "Cancelled by accountant"),
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

  if (feeQuery.isLoading) return <ScreenLoader />;
  if (feeQuery.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Billing"
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Billing", link: "/accountant/billing" },
        ]}
      />

      <div className="border border-border bg-background p-4">
        <div className="mb-3 text-sm font-semibold">Student Fees</div>
        <GenericTable
          tableHeads={[
            { key: "student", headName: "Student", minWidth: 220, render: (f: T_StudentFee) => `${studentFullName(f.student)}${f.student?.universityRegNo ? ` (${f.student.universityRegNo})` : ""}` },
            { key: "structure", headName: "Structure", minWidth: 180, render: (f: T_StudentFee) => f.feeStructure?.name ?? f.feeStructure?.code ?? f.feeStructureId ?? "—" },
            { key: "items", headName: "Items", minWidth: 100, render: (f: T_StudentFee) => String(f.items?.length ?? 0) },
            { key: "net", headName: "Total Net", minWidth: 140, render: (f: T_StudentFee) => `Rs. ${studentFeeNetTotal(f).toFixed(2)}` },
            { key: "due", headName: "Due Items", minWidth: 110, render: (f: T_StudentFee) => String(dueItemsCount(f)) },
          ]}
          data={fees}
          onSearch={(v) => { setFeeSearch(v); setFeePage(1); }}
          searchPlaceholder="Search by student, reg no..."
          emptyTitle="No student fees."
          pagination={{ page: feePage, limit: LIMIT, total: rowsFromList(feeQuery.data).total, onPageChange: setFeePage }}
        />
      </div>

      <div className="mt-6 border border-border bg-background p-4">
        <div className="mb-3 text-sm font-semibold">Record Fee Payment</div>
        <RecordPaymentForm />
      </div>

      <div className="mt-6 border border-border bg-background p-4">
        <div className="mb-3 text-sm font-semibold">Fee Payments</div>
        <GenericTable
          tableHeads={[
            { key: "receiptNo", headName: "Receipt No.", minWidth: 160 },
            { key: "student", headName: "Student", minWidth: 200, render: (p: T_FeePayment) => studentFullName(p.student) },
            { key: "total", headName: "Total", minWidth: 120, render: (p: T_FeePayment) => `Rs. ${Number(p.totalAmount).toFixed(2)}` },
            { key: "date", headName: "Date (BS)", minWidth: 120, render: (p: T_FeePayment) => p.paymentDateBs },
            { key: "status", headName: "Status", minWidth: 110, render: (p: T_FeePayment) => <Badge variant={p.isCancelled ? "destructive" : "default"}>{p.isCancelled ? "CANCELLED" : "VALID"}</Badge> },
          ]}
          data={payments}
          onSearch={(v) => { setPaySearch(v); setPayPage(1); }}
          searchPlaceholder="Search receipt / student..."
          emptyTitle="No payments."
          pagination={{ page: payPage, limit: LIMIT, total: rowsFromList(paymentsQuery.data).total, onPageChange: setPayPage }}
          renderActions={(p: T_FeePayment) => (
            <span className="flex items-center justify-end gap-2">
              <Link to={`/accountant/billing/receipt/${p.id}`} className="text-xs font-medium text-primary underline">
                Receipt
              </Link>
              {!p.isCancelled && (
                <button className="text-xs font-medium text-destructive underline" onClick={() => setCancelId(p.id)}>
                  Cancel
                </button>
              )}
            </span>
          )}
        />
        {cancelId && (
          <div className="mt-4 border border-border p-3">
            <label className="mb-1 block text-xs font-medium">Cancel reason *</label>
            <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation" />
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="destructive" disabled={!cancelReason.trim() || cancelMutation.isPending} loading={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
                Confirm Cancel
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCancelId("")}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 border border-border bg-background p-4">
        <div className="mb-3 text-sm font-semibold">Installments</div>
        <div className="mb-3 max-w-md">
          <Input
            placeholder="Filter by student fee item ID..."
            value={instItemId}
            onChange={(e) => { setInstItemId(e.target.value); setInstPage(1); }}
          />
        </div>
        <GenericTable
          tableHeads={[
            { key: "item", headName: "Fee Item", minWidth: 220, render: (it: T_Installment) => it.studentFeeItem?.feeHead?.name ?? it.studentFeeItem?.description ?? it.studentFeeItemId },
            { key: "no", headName: "No.", minWidth: 80, render: (it: T_Installment) => String(it.installmentNo) },
            { key: "due", headName: "Due (BS)", minWidth: 120, render: (it: T_Installment) => it.dueDateBs },
            { key: "amount", headName: "Amount", minWidth: 120, render: (it: T_Installment) => `Rs. ${Number(it.amount).toFixed(2)}` },
          ]}
          data={installments}
          emptyTitle="No installments."
          pagination={{ page: instPage, limit: LIMIT, total: rowsFromList(installmentsQuery.data).total, onPageChange: setInstPage }}
          searchPlaceholder="Search installments..."
        />
      </div>
    </div>
  );
}
