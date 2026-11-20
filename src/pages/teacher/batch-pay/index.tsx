import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PenSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useCan } from "@/auth/use-can";
import { useAuth } from "@/auth/context/auth-context";
import {
  listBatchPays,
  type T_TEACHER_BATCH_PAY,
} from "./service/service";
import { teachingAssignmentLabel } from "@/lib/teaching-assignment-label";

const LIMIT = 20;

function assignmentLabel(r: T_TEACHER_BATCH_PAY): string {
  const label = teachingAssignmentLabel(r.teachingAssignment);
  return label || r.teachingAssignmentId || "—";
}
function fmt(v: number | string | null | undefined): string {
  if (v == null || v === "") return "—";
  return String(v);
}
function toRows(raw: unknown): { rows: T_TEACHER_BATCH_PAY[]; total: number } {
  const r = raw as {
    data?:
      | T_TEACHER_BATCH_PAY[]
      | { data?: T_TEACHER_BATCH_PAY[]; pagination?: { total?: number } };
  };
  const rows: T_TEACHER_BATCH_PAY[] = Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
  const total: number =
    Number(!Array.isArray(r?.data) ? r?.data?.pagination?.total : undefined) ||
    rows.length;
  return { rows, total };
}

export default function TeacherBatchPayPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  // Teachers may only READ their own batch pays. Creating/changing one is an
  // accountant/admin task because it feeds straight into payroll.
  const canManage = useCan("teacher:batchPay:manage");
  const { user } = useAuth();
  const isTeacherView = user?.role === "TEACHER";

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_BATCH_PAY, page, search],
    queryFn: () => listBatchPays({ page, limit: LIMIT, search }),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const { rows, total } = toRows(query.data);

  const head: T_TableHead<T_TEACHER_BATCH_PAY>[] = [
    {
      key: "teachingAssignment",
      headName: "Teaching Assignment",
      minWidth: 220,
      render: (r) => assignmentLabel(r),
    },
    {
      key: "ratePerCreditHour",
      headName: "Rate / Credit Hour",
      minWidth: 160,
      render: (r) => fmt(r.ratePerCreditHour),
    },
    {
      key: "fixedMonthlyAmount",
      headName: "Fixed Monthly",
      minWidth: 140,
      render: (r) => fmt(r.fixedMonthlyAmount),
    },
    {
      key: "effectiveFromBs",
      headName: "Effective From (BS)",
      minWidth: 150,
      render: (r) => r.effectiveFromBs ?? "—",
    },
    {
      key: "effectiveToBs",
      headName: "Effective To (BS)",
      minWidth: 150,
      render: (r) => r.effectiveToBs ?? "—",
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Batch Pay"
        description={
          canManage
            ? "Extra pay on top of base salary for a class, applied in payroll."
            : "Read-only view of the extra pay set up for your classes."
        }
        breadCrumbItems={
          isTeacherView
            ? [
                { title: "Teacher", link: "/teacher" },
                { title: "Batch Pay", link: "/teacher/batch-pay" },
              ]
            : [{ title: "Batch Pay", link: "/accountant/batch-pay" }]
        }
        createPage={canManage ? "/accountant/batch-pay/create" : undefined}
      />

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search batch pays..."
        emptyTitle="No batch pays yet."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        renderActions={
          canManage
            ? (r) => (
                <DropdownMenuItem
                  onClick={() => navigate(`/accountant/batch-pay/${r.id}/edit`)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm cursor-pointer"
                >
                  <PenSquare className="h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              )
            : undefined
        }
      />
    </div>
  );
}
