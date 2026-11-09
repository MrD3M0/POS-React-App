import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getPayslipById, type T_PAYSLIP, type T_PAYSLIP_ITEM } from "./service/service";

function fmtMoney(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? String(value) : n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StaffPayslipDetailPage() {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PAYSLOPS, id],
    queryFn: () => getPayslipById(id!),
    enabled: !!id,
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !id) return <AlertHandler variant="error" />;

  const slip = (query.data?.data ?? {}) as T_PAYSLIP;
  const payroll = slip.payroll ?? {};
  const employee = slip.employee ?? {};
  const items: T_PAYSLIP_ITEM[] = Array.isArray(slip.items) ? (slip.items as T_PAYSLIP_ITEM[]) : [];

  const payrollLabel = payroll.monthBs || payroll.yearBs
    ? `${payroll.yearBs ?? ""}/${String(payroll.monthBs ?? "").padStart(2, "0")}`.replace("/", "/ Bs-")
    : "—";

  const head: T_TableHead<T_PAYSLIP_ITEM>[] = [
    { key: "description", headName: "Description", minWidth: 260 },
    { key: "type", headName: "Type", minWidth: 160, render: (i) => (i.isDeduction ? "Deduction" : i.isEmployerContribution ? "Employer Contribution" : "Earning") },
    { key: "amount", headName: "Amount", minWidth: 160, render: (i) => fmtMoney(i.amount) },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title={`Payslip ${slip.payslipNo ?? ""}`}
        breadCrumbItems={[
          { title: "Staff", link: "/staff/payslips" },
          { title: "Payslips", link: "/staff/payslips" },
          { title: slip.payslipNo ?? "Detail", link: `/staff/payslips/${id}` },
        ]}
        backPage="/staff/payslips"
        actions={
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            Print
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <InfoCard label="Payslip No." value={slip.payslipNo} />
        <InfoCard label="Payroll Month" value={payrollLabel} />
        <InfoCard label="Employee" value={[employee.firstName, employee.lastName].filter(Boolean).join(" ") || "—"} />
        <InfoCard label="Paid Date (BS)" value={slip.paidDateBs ?? "—"} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Attendance Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <InfoCard label="Present Days" value={String(slip.presentDays ?? "—")} />
        <InfoCard label="Half Days" value={String(slip.halfDays ?? "—")} />
        <InfoCard label="Paid Leave Days" value={String(slip.paidLeaveDays ?? "—")} />
        <InfoCard label="Unpaid Leave Days" value={String(slip.unpaidLeaveDays ?? "—")} />
        <InfoCard label="Absent Days" value={String(slip.absentDays ?? "—")} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Pay Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <InfoCard label="Basic Salary" value={fmtMoney(slip.basicSalary)} />
        <InfoCard label="Total Allowance" value={fmtMoney(slip.totalAllowance)} />
        <InfoCard label="Gross Pay" value={fmtMoney(slip.grossPay)} />
        <InfoCard label="Attendance Deduction" value={fmtMoney(slip.attendanceDeduction)} />
        <InfoCard label="Total Deduction" value={fmtMoney(slip.totalDeduction)} />
        <InfoCard label="Tax Amount" value={fmtMoney(slip.taxAmount)} />
        <InfoCard label="Net Pay" value={fmtMoney(slip.netPay)} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Payslip Items</h2>
      <GenericTable
        tableHeads={head}
        data={items}
        emptyTitle="No payslip items."
        renderRow={(r) => ({ description: r.description, amount: fmtMoney(r.amount) } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}
