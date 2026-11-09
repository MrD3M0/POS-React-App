import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getOwnStaff } from "../profile/edit/service/service";
import { listMyPayslips, type T_PAYSLIP } from "./service/service";

const LIMIT = 20;

function fmtMoney(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? String(value) : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function payrollLabel(row: T_PAYSLIP): string {
  const payroll = row.payroll ?? {};
  if (payroll.monthBs || payroll.yearBs) {
    return `${payroll.yearBs ?? ""}/${String(payroll.monthBs ?? "").padStart(2, "0")}`.replace("/", "/ Bs-");
  }
  const raw = row as Record<string, unknown>;
  return (raw.payrollMonth as string) ?? (raw.month as string) ?? "—";
}

export default function StaffPayslipsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const staffQuery = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PROFILE],
    queryFn: getOwnStaff,
  });
  const staff = staffQuery.data?.data as Record<string, any> | undefined;
  const employeeId = (staff?.employeeId ?? staff?.employee?.id) as string | undefined;

  const query = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PAYSLOPS, employeeId, page, search],
    queryFn: () => listMyPayslips({ page, limit: LIMIT, search, employeeId }),
    // Wait for the profile lookup to settle so we can filter by employeeId
    // when available; if it fails, fall back to listing all payslips.
    enabled: staffQuery.isSuccess || staffQuery.isError,
  });

  if (staffQuery.isLoading || query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PAYSLIP[] = Array.isArray(query.data?.data?.data)
    ? query.data.data.data
    : Array.isArray(query.data?.data)
      ? query.data.data
      : [];
  const total = query.data?.data?.pagination?.total ?? rows.length;

  const head: T_TableHead<T_PAYSLIP>[] = [
    { key: "payslipNo", headName: "Payslip No.", minWidth: 140 },
    { key: "payrollMonth", headName: "Payroll Month", minWidth: 160, render: (r) => payrollLabel(r) },
    { key: "grossPay", headName: "Gross Pay", minWidth: 160, render: (r) => fmtMoney(r.grossPay) },
    { key: "totalDeduction", headName: "Deductions", minWidth: 160, render: (r) => fmtMoney(r.totalDeduction) },
    { key: "netPay", headName: "Net Pay", minWidth: 160, render: (r) => fmtMoney(r.netPay) },
    {
      key: "paidDateBs",
      headName: "Paid Date",
      minWidth: 160,
      render: (r) => (r as Record<string, unknown>).paidDateBs as string ?? (r as Record<string, unknown>).paidDate as string ?? "—",
    },
  ];

  return (
    <div className="p-5">
      <PageHeader title="My Payslips" breadCrumbItems={[{ title: "Staff", link: "/staff/payslips" }, { title: "Payslips", link: "/staff/payslips" }]} />

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search payslips..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No payslips."
        renderRow={(r) => ({
          payslipNo: r.payslipNo ?? "—",
          payrollMonth: payrollLabel(r),
          grossPay: fmtMoney(r.grossPay),
          totalDeduction: fmtMoney(r.totalDeduction),
          netPay: fmtMoney(r.netPay),
          paidDateBs: ((r as Record<string, unknown>).paidDateBs as string) ?? ((r as Record<string, unknown>).paidDate as string) ?? "—",
        } as Record<string, React.ReactNode>)}
        renderActions={(r) => (
          <Link
            to={`/staff/payslips/${r.id}`}
            aria-label={`View payslip ${r.payslipNo ?? r.id}`}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <Eye className="size-3.5" />
          </Link>
        )}
      />
    </div>
  );
}
