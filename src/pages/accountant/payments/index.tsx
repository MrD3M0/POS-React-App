import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import { StatusPill } from "@/components/ui/status-badge";
import GenericTable from "@/components/generic-table";
import Button from "@/components/ui/button";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listPayments, type T_PAYMENT } from "./service/service";
import { useState } from "react";

const LIMIT = 20;

export default function AccountantPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_PAYMENTS, search, page],
    queryFn: () => listPayments({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: T_PAYMENT[] = query.data?.data?.data ?? [];

  return (
    <div className="p-5">
      <PageHeader
        title="Student Payments"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Student Payments", link: "/accountant/payments" }]}
      />
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <a href="/accountant/payments/create">New Payment</a>
        </Button>
      </div>

      <GenericTable
        tableHeads={[
          { key: "studentName", headName: "Student", minWidth: 200 },
          { key: "courseName", headName: "Course / Batch", minWidth: 220 },
          { key: "amountDue", headName: "Amount Due", minWidth: 160 },
          { key: "status", headName: "Status", minWidth: 120, render: (p: T_PAYMENT) => <StatusPill status={p.status}>{p.status ?? "—"}</StatusPill> },
          { key: "receiptNo", headName: "Receipt No.", minWidth: 180 },
        ]}
        data={rows}
        onSearch={setSearch}
        emptyTitle="No outstanding payments."
        pagination={{ page, limit: LIMIT, total: query.data?.data?.pagination?.total ?? 0, onPageChange: setPage }}
        searchPlaceholder="Search payments..."
        renderRow={(p: T_PAYMENT) => ({
          studentName: p.studentName, amountDue: `₹${p.amountDue}`, status: p.status, receiptNo: p.receiptNo ?? "—",
        } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}
