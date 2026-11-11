import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import GenericTable from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  listStudentFees,
  studentFullName,
  studentFeeNetTotal,
  dueItemsCount,
  type T_StudentFee,
} from "./service/service";

const LIMIT = 20;

function rowsFromList(data: unknown): { rows: unknown[]; total: number } {
  const raw = data as { data?: unknown; pagination?: { total?: number } };
  if (Array.isArray(raw?.data)) return { rows: raw.data, total: raw?.pagination?.total ?? raw.data.length };
  const nested = raw?.data as { data?: unknown[]; pagination?: { total?: number } } | undefined;
  if (nested && Array.isArray(nested.data)) return { rows: nested.data, total: nested?.pagination?.total ?? nested.data.length };
  return { rows: [], total: 0 };
}

/**
 * Student Fees — what every student owes (the fee copied from the structure).
 * The payments and the installments live on their own pages.
 */
export default function AccountantBillingPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING, "fees", search, page],
    queryFn: () => listStudentFees({ page, limit: LIMIT, search }),
  });

  const fees = useMemo(
    () => rowsFromList(query.data).rows as T_StudentFee[],
    [query.data],
  );

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Student Fees"
        description="The fee of every student, copied from the fee structure."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant/dashboard" },
          { title: "Student Fees", link: "/accountant/billing" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/accountant/billing/installments">Installments</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/accountant/billing/record">Record Payment</Link>
            </Button>
          </div>
        }
      />

      <GenericTable
        tableHeads={[
          {
            key: "student",
            headName: "Student",
            minWidth: 220,
            render: (f: T_StudentFee) =>
              `${studentFullName(f.student)}${f.student?.universityRegNo ? ` (${f.student.universityRegNo})` : ""}`,
          },
          {
            key: "structure",
            headName: "Structure",
            minWidth: 180,
            render: (f: T_StudentFee) =>
              f.feeStructure?.name ?? f.feeStructure?.code ?? f.feeStructureId ?? "—",
          },
          {
            key: "items",
            headName: "Items",
            minWidth: 100,
            render: (f: T_StudentFee) => String(f.items?.length ?? 0),
          },
          {
            key: "net",
            headName: "Total Net",
            minWidth: 140,
            render: (f: T_StudentFee) => `Rs. ${studentFeeNetTotal(f).toFixed(2)}`,
          },
          {
            key: "due",
            headName: "Due Items",
            minWidth: 110,
            render: (f: T_StudentFee) => String(dueItemsCount(f)),
          },
        ]}
        data={fees}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by student, reg no..."
        emptyTitle="No student fee."
        pagination={{
          page,
          limit: LIMIT,
          total: rowsFromList(query.data).total,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
