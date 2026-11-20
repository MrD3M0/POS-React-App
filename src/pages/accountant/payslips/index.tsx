import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import { StatusPill } from "@/components/ui/status-badge";
import GenericTable from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listPayslips, type T_PAYSLIP } from "./service/service";
import { useState } from "react";

const LIMIT = 20;

export default function AccountantPayslipsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_PAYSLIPS, search, page],
    queryFn: () => listPayslips({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PAYSLIP_ROW[] = (query.data?.data?.data ?? []).map((slip) => ({
    id: slip.id,
    payslipNo: slip.payslipNo,
    employee: slip.employee
      ? [slip.employee.firstName, slip.employee.middleName, slip.employee.lastName]
          .filter(Boolean)
          .join(" ")
      : slip.employeeId,
    payrollMonth: slip.payroll
      ? `${slip.payroll.yearBs}-${String(slip.payroll.monthBs).padStart(2, "0")}`
      : "—",
    grossPay: Number(slip.grossPay ?? 0),
    netPay: Number(slip.netPay ?? 0),
    paidDate: slip.paidDateBs ?? "—",
    status: slip.payroll?.status ?? "—",
  }));

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="p-5">
      <PageHeader
        title="Payslips"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Payslips", link: "/accountant/payslips" }]}
      />

      <GenericTable
        tableHeads={[
          { key: "payslipNo", headName: "Payslip No.", minWidth: 160 },
          { key: "employee", headName: "Employee", minWidth: 200 },
          { key: "payrollMonth", headName: "Payroll Month", minWidth: 160 },
          { key: "grossPay", headName: "Gross", minWidth: 140 },
          { key: "netPay", headName: "Net", minWidth: 140 },
          { key: "paidDate", headName: "Paid Date", minWidth: 160 },
          { key: "status", headName: "Status", minWidth: 140, render: (p: T_PAYSLIP_ROW) => <StatusPill status={p.status}>{p.status ?? "—"}</StatusPill> },
        ]}
        data={rows}
        emptyTitle="No payslips found."
        pagination={{ page, limit: LIMIT, total: query.data?.data?.pagination?.total ?? 0, onPageChange: setPage }}
        searchPlaceholder="Search payslips..."
        onSearch={handleSearch}
      />
    </div>
  );
}

type T_PAYSLIP_ROW = {
  id: string;
  payslipNo: string;
  employee: string;
  payrollMonth: string;
  grossPay: number;
  netPay: number;
  paidDate: string;
  status: string;
};

// Keep the raw backend type referenced so the list shape stays in sync.
export type { T_PAYSLIP };
