import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import GenericTable from "@/components/generic-table";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import QUERY_KEYS from "@/lib/query-keys";
import { listPayments } from "./service/service";
import SplitPaymentDialog from "./dialog/split-payment-dialog";
import { useState } from "react";

const LIMIT = 20;

export default function AccountantPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [payOpen, setPayOpen] = useState(false);

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
      <div className="flex flex-wrap gap-3 w-full max-w-4xl mb-4">
        <Input placeholder="Search payments..." onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Button variant="outline" size="sm" onClick={() => setPayOpen(true)}>New Payment</Button>
      </div>

      <GenericTable
        tableHeads={[
          { key: "studentName", headName: "Student", minWidth: 200 },
          { key: "courseName", headName: "Course / Batch", minWidth: 220 },
          { key: "amountDue", headName: "Amount Due", minWidth: 160 },
          { key: "status", headName: "Status", minWidth: 120, render: (p: T_PAYMENT) => <Badge variant={p.status === "PAID" ? "success" : p.status === "PARTIAL" ? "warning" : "outline"}>{p.status}</Badge> },
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

      {payOpen && <SplitPaymentDialog onClose={() => setPayOpen(false)} />}
    </div>
  );
}

type T_PAYMENT = {
  id: string;
  studentName: string;
  courseName: string;
  amountDue: number;
  status: "OUTSTANDING" | "PARTIAL" | "PAID" | "CANCELLED";
  receiptNo?: string;
  paidDate?: string;
  methodLines?: { methodId: string; methodCode: string; amount: number; referenceNo?: string }[];
};