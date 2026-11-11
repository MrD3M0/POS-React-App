import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { QUERY_KEYS } from "@/lib/query-keys";
import { useCan } from "@/auth/permissions";
import { useAuth } from "@/auth/context/auth-context";
import type { T_UseQueryError } from "@/types/common";
import { listMyClasses, type T_MY_CLASS } from "../my-classes/service/service";
import {
  listBatchPays,
  createBatchPay,
  updateBatchPay,
  type T_TEACHER_BATCH_PAY,
} from "./service/service";
import CreateBatchPayForm from "./components/create-batch-pay-form";
import EditBatchPayForm from "./components/edit-batch-pay-form";
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
function toClassRows(raw: unknown): T_MY_CLASS[] {
  const r = raw as { data?: T_MY_CLASS[] | { data?: T_MY_CLASS[] } };
  return Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
}

export default function TeacherBatchPayPage() {
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editRecord, setEditRecord] = useState<T_TEACHER_BATCH_PAY | null>(
    null,
  );
  const qc = useQueryClient();
  const { user } = useAuth();
  // Teachers may only READ their own batch pays. Creating/changing one is an
  // accountant/admin task because it feeds straight into payroll.
  const canManage = useCan("teacher:batchPay:manage");
  const isTeacherView = user?.role === "TEACHER";

  const query = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_BATCH_PAY, page, search],
    queryFn: () => listBatchPays({ page, limit: LIMIT, search }),
  });
  const classQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MY_CLASSES, "unlimited"],
    queryFn: () => listMyClasses({ page: 1, limit: 999 }),
    enabled: canManage,
  });

  const createMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => createBatchPay(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_BATCH_PAY] });
      toast.success("Batch pay created");
      setMode("list");
    },
    onError: (error) =>
      toast.error(
        (error as AxiosError<T_UseQueryError>)?.response?.data?.message ??
          "Failed to create batch pay",
      ),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateBatchPay(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_BATCH_PAY] });
      toast.success("Batch pay updated");
      setMode("list");
      setEditRecord(null);
    },
    onError: (error) =>
      toast.error(
        (error as AxiosError<T_UseQueryError>)?.response?.data?.message ??
          "Failed to update batch pay",
      ),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const { rows, total } = toRows(query.data);
  const classes = toClassRows(classQuery.data);

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
      />
      {canManage ? (
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode("list");
                setEditRecord(null);
              }}
              className={`rounded px-3 py-1 text-sm font-medium ${mode === "list" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              List
            </button>
            <button
              onClick={() => {
                setMode("create");
                setEditRecord(null);
              }}
              className={`rounded px-3 py-1 text-sm font-medium ${mode === "create" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              Create Batch Pay
            </button>
          </div>
        </div>
      ) : null}

      {mode === "list" && (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditRecord(r);
                      setMode("edit");
                    }}
                  >
                    Edit
                  </Button>
                )
              : undefined
          }
        />
      )}

      {canManage && mode === "create" && (
        <CreateBatchPayForm
          classes={classes}
          classesLoading={classQuery.isLoading}
          isPending={createMut.isPending}
          onCancel={() => setMode("list")}
          onSubmit={(payload) => createMut.mutate(payload)}
        />
      )}

      {canManage && mode === "edit" && editRecord && (
        <EditBatchPayForm
          key={editRecord.id}
          record={editRecord}
          classes={classes}
          classesLoading={classQuery.isLoading}
          isPending={updateMut.isPending}
          onCancel={() => {
            setMode("list");
            setEditRecord(null);
          }}
          onSubmit={(id, payload) => updateMut.mutate({ id, data: payload })}
        />
      )}
    </div>
  );
}
