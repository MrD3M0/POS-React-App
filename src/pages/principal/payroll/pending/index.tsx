import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import type { T_PENDING_PAYROLL } from "./service/service";

const LIMIT = 20;

export default function PrincipalPendingPayrollPage() {
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.PRINCIPAL_PAYROLL_PENDING, page],
    queryFn: () => fetch("/principal/payroll/pending").then((r) => r.json()),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PENDING_PAYROLL[] = query.data?.data?.data ?? [];
  const total = query.data?.data?.pagination?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const approveMut = useMutation({
    mutationFn: ({ payrollId }) => approvePayroll(payrollId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_PAYROLL_PENDING] }); toast.success("Payroll approved"); },
  });

  const rejectMut = useMutation({
    mutationFn: ({ payrollId, reason }) => rejectPayroll(payrollId, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_PAYROLL_PENDING] }); toast.success("Payroll rejected"); },
  });

  const head: T_TableHead<T_PENDING_PAYROLL>[] = [
    { key: "employeeName", headName: "Employee", minWidth: 200 },
    { key: "month", headName: "Month", minWidth: 160 },
    { key: "status", headName: "Status", minWidth: 180, render: (p) => <Badge variant={p.status === "APPROVED" ? "success" : "warning"}>{p.status}</Badge> },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Pending Payroll"
        breadCrumbItems={[{ title: "Principal", link: "/principal" }, { title: "Pending Payroll", link: "/principal/payroll/pending" }]}
      />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search payroll..." onChange={() => {}} />
        <span className="self-center text-xs text-muted-foreground">Monthly payroll submitted by Accountant.</span>
      </div>
      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={() => {}}
        emptyTitle="No pending payroll."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search payroll..."
        renderRow={(p) => ({ employeeName: p.employeeName, status: p.status }) as Record<string, ReactNode>}
      />
    </div>
  );
}

type T_PENDING_PAYROLL = {
  id?: string;
  employeeName: string;
  month: string;
  status: "DRAFT" | "APPROVED" | "REJECTED" | "PAID";
  remarks?: string | null;
};

async function approvePayroll(id: string): Promise<{ message: string }> {
  const res = await fetch(`/principal/payroll/${id}/approve`);
  return res.json();
}

async function rejectPayroll(id: string, reason: string): Promise<{ message: string }> {
  const res = await fetch(`/principal/payroll/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  return res.json();
}
