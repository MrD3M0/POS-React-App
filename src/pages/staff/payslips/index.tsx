import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "sonner";
import QUERY_KEYS from "@/lib/query-keys";

const LIMIT = 20;

export default function StaffPayslipsPage() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PAYSLOPS, search],
    queryFn: () => ({ payslipsUrl: "/staff/payslips" }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PAYSLEFT[] = query.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader title="My Payslips" breadCrumbItems={[{ title: "Staff", link: "/staff" }, { title: "Payslips", link: "/staff/payslips" }]} />
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search payslips..." onChange={(e) => { setSearch(e.target.value); }} />
      </div>

      <GenericTableHelper status={rows} search={search} />
    </div>
  );
}

function GenericTableHelper({ status, search }: { status: T_PAYSLEFT[]; search: string }) {
  const head = [
    { key: "month", headName: "Month", minWidth: 180 },
    { key: "grossPay", headName: "Gross Pay", minWidth: 160 },
    { key: "netPay", headName: "Net Pay", minWidth: 160 },
    { key: "status", headName: "Status", minWidth: 140, render: (r: any) => <Badge variant={r.status === "PAID" ? "success" : r.status === "PENDING" ? "warning" : "outline"}>{r.status}</Badge> },
  ];
  const [pag, setPag] = useState({ page: 1, limit: LIMIT, total: status.length, onPageChange: () => {} });
  return <GenericTable head={head} data={status} pagination={pag} searchPlaceholder={search ? `Search (${search.slice(0, 10)}...)` : "Search payslips..."} emptyTitle="" />;
}

type T_PAYSLEFT = { id: string; month: string; grossPay: number; netPay: number; status: string };
