import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getFeePaymentById, studentFullName } from "../service/service";

export default function AccountantBillingReceiptPage() {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING_RECEIPT, id],
    queryFn: () => getFeePaymentById(id!),
    enabled: !!id,
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !id) return <AlertHandler variant="error" />;

  const payment = query.data?.data;
  if (!payment) return <AlertHandler variant="error" />;

  const methodLines = payment.methodLines ?? [];
  const allocations = payment.allocations ?? [];

  return (
    <div className="p-5">
      <style>{`@media print { .no-print { display: none !important; } body * { visibility: hidden; } #print-receipt, #print-receipt * { visibility: visible; } #print-receipt { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
      <PageHeader
        title="Payment Receipt"
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Billing", link: "/accountant/billing" },
          { title: "Receipt", link: `/accountant/billing/receipt/${id}` },
        ]}
        backPage="/accountant/billing"
        actions={
          <div className="no-print">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              Print Receipt
            </Button>
          </div>
        }
      />

      <div id="print-receipt" className="mx-auto w-full max-w-3xl border border-border bg-background p-6">
        <div className="flex items-start justify-between gap-4 border-b-2 border-primary pb-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Payment Receipt</div>
            <div className="mt-1 text-lg font-bold">{payment.receiptNo}</div>
          </div>
          <Badge variant={payment.isCancelled ? "destructive" : "default"}>{payment.isCancelled ? "CANCELLED" : "VALID"}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Student:</span> <span className="font-medium">{studentFullName(payment.student)}</span>
            {payment.student?.universityRegNo && <div className="text-xs text-muted-foreground">Reg: {payment.student.universityRegNo}</div>}
          </div>
          <div>
            <span className="text-muted-foreground">Fiscal Year:</span> <span className="font-medium">{payment.fiscalYear?.name ?? "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Date (BS):</span> <span className="font-medium">{payment.paymentDateBs}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total:</span> <span className="font-medium">Rs. {Number(payment.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {payment.cancelReason && (
          <div className="mt-3 border border-destructive/40 bg-destructive/5 p-3 text-xs">
            Cancelled: {payment.cancelReason}
            {payment.cancelledAt ? ` — ${payment.cancelledAt}` : ""}
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold">Payment Methods</div>
          <table className="w-full border border-border text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border-r px-2 py-1.5 text-left text-xs">Method</th>
                <th className="border-r px-2 py-1.5 text-left text-xs">Reference</th>
                <th className="px-2 py-1.5 text-right text-xs">Amount</th>
              </tr>
            </thead>
            <tbody>
              {methodLines.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-2 py-2 text-center text-muted-foreground">No method lines.</td>
                </tr>
              ) : (
                methodLines.map((m, i) => (
                  <tr key={i} className="border-t">
                    <td className="border-r px-2 py-1.5">{m.paymentMethod?.name ?? m.paymentMethodId} {m.paymentMethod?.code ? `(${m.paymentMethod.code})` : ""}</td>
                    <td className="border-r px-2 py-1.5">{m.referenceNo ?? "—"}</td>
                    <td className="px-2 py-1.5 text-right">Rs. {Number(m.amount).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold">Allocations</div>
          <table className="w-full border border-border text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border-r px-2 py-1.5 text-left text-xs">Fee Item</th>
                <th className="px-2 py-1.5 text-right text-xs">Amount</th>
              </tr>
            </thead>
            <tbody>
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-2 py-2 text-center text-muted-foreground">No allocations.</td>
                </tr>
              ) : (
                allocations.map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="border-r px-2 py-1.5">{a.studentFeeItem?.feeHead?.name ?? a.studentFeeItem?.description ?? a.studentFeeItemId}</td>
                    <td className="px-2 py-1.5 text-right">Rs. {Number(a.amount).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex justify-end border-t border-border pt-3 text-sm font-semibold">
          <span>Total: Rs. {Number(payment.totalAmount).toFixed(2)}</span>
        </div>
      </div>

      <div className="no-print mt-4 flex justify-center">
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          Print Receipt
        </Button>
      </div>
    </div>
  );
}
