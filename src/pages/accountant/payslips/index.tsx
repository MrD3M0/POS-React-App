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

const LIMIT = 20;

export default function AccountantPayslipsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [payrollId, setPayrollId] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_PAYSLIPS, search, page],
    queryFn: () => ({ payslipsUrl: "/accountant/payslips" }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PAYSLEFT[] = query.data?.data?.data ?? [];

  // Mark payroll as paid
  const markPaidMut = useMutation({
    mutationFn: async ({ payrollId }) => markPaid(payrollId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_PAYSLIPS] }); toast.success("Payroll marked as paid"); },
  });

  const head: T_TableHead<T_PAYSLEFT>[] = [
    { key: "employeeName", headName: "Employee", minWidth: 200 },
    { key: "month", headName: "Month", minWidth: 160 },
    { key: "grossPay", headName: "Gross Pay", minWidth: 140 },
    { key: "netPay", headName: "Net Pay", minWidth: 140 },
    { key: "status", headName: "Status", minWidth: 140, render: (p) => <Badge variant={p.status === "PAID" ? "success" : p.status === "PENDING" ? "warning" : "outline"}>{p.status}</Badge> },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Payslips"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Payslips", link: "/accountant/payslips" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search payslips..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <span className="self-center text-xs text-muted-foreground">Mark approved payrolls as paid — creates the payroll journal entry.</span>
      </div>

      <GenericTable
        tableHeads={head}
        data={rows}
        emptyTitle="No payslips."
        pagination={{ page, limit: LIMIT, total: 0, onPageChange: setPage }}
        searchPlaceholder="Search payslips..."
        renderRow={(p) => ({ employeeName: p.employeeName, month: p.month, grossPay: `₹${p.grossPay}`, netPay: `₹${p.netPay}`, status: p.status } as Record<string, React.ReactNode>)}
      />

      {payrollId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border p-6 space-y-3">
            <h3 className="font-semibold">Mark as Paid?</h3>
            <p className="text-sm text-muted-foreground">Once marked, a payroll journal entry is created and the payslip is official.</p>
            <Button variant="primary" size="sm" disabled={markPaidMut.isPending} onClick={async () => { await markPaidMut.mutateAsync({ payrollId }); }}>
              {markPaidMut.isPending ? "Marking..." : "Mark as Paid"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

type T_PAYSLEFT = {
  id: string;
  employeeName: string;
  month: string;
  grossPay: number;
  netPay: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "PAID";
};

async function markPaid(payrollId: string): Promise<{ message: string }> {
  await fetch(`/accountant/payroll/${payrollId}/mark-paid`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("auth")}` },
    body: JSON.stringify({ paymentMethod: "", paidDate: "" }),
  });
}
