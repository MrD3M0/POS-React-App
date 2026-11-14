import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listPendingPayrolls, approvePayroll, rejectPayroll } from "./service/service";
import type { T_PENDING_PAYROLL } from "./service/service";

const LIMIT = 20;

export default function PrincipalPendingPayrollPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_PAYROLL_PENDING, page, search],
    queryFn: () => listPendingPayrolls({ page, limit: LIMIT, search }),
  });

  const approveMut = useMutation({
    mutationFn: (payrollId: string) => approvePayroll(payrollId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_PAYROLL_PENDING] }); toast.success("Payroll approved"); },
    onError: () => toast.error("Failed to approve payroll."),
  });

  const rejectMut = useMutation({
    mutationFn: (payrollId: string) => rejectPayroll(payrollId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_PAYROLL_PENDING] }); toast.success("Payroll rejected"); },
    onError: () => toast.error("Failed to reject payroll."),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PENDING_PAYROLL[] = Array.isArray(query.data?.data?.data)
    ? query.data.data.data
    : Array.isArray(query.data?.data)
      ? query.data.data
      : [];
  const total = query.data?.data?.pagination?.total ?? rows.length;

  const head: T_TableHead<T_PENDING_PAYROLL>[] = [
    { key: "employeeName", headName: "Employee", minWidth: 200 },
    { key: "month", headName: "Month", minWidth: 160 },
    { key: "status", headName: "Status", minWidth: 180, render: (p) => <Badge variant={p.status === "APPROVED" ? "success" : p.status === "REJECTED" ? "destructive" : "warning"}>{p.status}</Badge> },
    {
      key: "action",
      headName: "Action",
      minWidth: 180,
      render: (p) => (
        <div className="flex gap-2">
          <button className="text-xs font-medium text-primary underline" onClick={() => approveMut.mutate(p.id)}>Approve</button>
          <button className="text-xs font-medium text-destructive underline" disabled={rejectMut.isPending} onClick={() => rejectMut.mutate(p.id)}>Reject</button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Pending Payroll"
        breadCrumbItems={[{ title: "Principal", link: "/principal" }, { title: "Pending Payroll", link: "/principal/payroll/pending" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <span className="self-center text-xs text-muted-foreground">Monthly payroll submitted by Accountant.</span>
      </div>
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No pending payroll."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search payroll..."
        renderRow={(p) => ({ employeeName: p.employeeName, month: p.month, status: p.status }) as Record<string, ReactNode>}
      />
    </div>
  );
}
