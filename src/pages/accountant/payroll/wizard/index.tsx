import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BsDatePicker } from "@/components/bs-datepicker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import type { T_UseQueryError } from "@/types/common";
import PayrollFormDialog from "./form/payroll-form";
import { listPayrolls, markPaid, submitPayroll, type T_PAYROLL } from "./service/service";
import { BS_MONTH_OPTIONS, payPayrollSchema, type PayPayrollValues } from "./schema";

const LIMIT = 20;

type PayrollRow = T_PAYROLL & { payslipCount?: number };

function monthLabel(m?: number) {
  const found = BS_MONTH_OPTIONS.find((o) => Number(o.value) === m);
  return found ? found.label : m != null ? String(m) : "—";
}

function statusVariant(status?: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
  switch (status) {
    case "PAID":
      return "success";
    case "APPROVED":
      return "default";
    case "PENDING":
      return "warning";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}

export default function AccountantPayrollWizardPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<PayrollRow | null>(null);
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_PAYROLL, "list", page, search],
    queryFn: () => listPayrolls({ page, limit: LIMIT, search }),
  });

  const submitMut = useMutation({
    mutationFn: (id: string) => submitPayroll(id),
    onSuccess: () => {
      toast.success("Payroll submitted for approval.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_PAYROLL] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_PAYROLL_PENDING] });
    },
    onError: (e: AxiosError<T_UseQueryError>) => toast.error(e.response?.data?.message ?? "Failed to submit payroll."),
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError) return <AlertHandler variant="error" />;

  const rows: PayrollRow[] = (query.data?.data?.data ?? query.data?.data ?? []) as PayrollRow[];
  const total = query.data?.data?.pagination?.total ?? query.data?.pagination?.total ?? rows.length;

  const head: T_TableHead<PayrollRow>[] = [
    { key: "period", headName: "Period (BS)", minWidth: 180, render: (r) => `${r.yearBs ?? "—"} / ${monthLabel(r.monthBs)}` },
    { key: "totalDays", headName: "Days", minWidth: 90, render: (r) => String(r.totalDays ?? "—") },
    { key: "payslips", headName: "Payslips", minWidth: 100, render: (r) => String(r.payslipCount ?? (Array.isArray(r.payslips) ? r.payslips.length : "—")) },
    { key: "status", headName: "Status", minWidth: 120, render: (r) => <Badge variant={statusVariant(r.status)}>{r.status ?? "—"}</Badge> },
    { key: "paidDateBs", headName: "Paid Date (BS)", minWidth: 140, render: (r) => String(r.paidDateBs ?? "—") },
    {
      key: "action",
      headName: "Action",
      minWidth: 220,
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {(r.status === "DRAFT" || r.status === "REJECTED") && (
            <Button type="button" variant="outline" size="sm" loading={submitMut.isPending} onClick={() => submitMut.mutate(r.id)}>
              Submit
            </Button>
          )}
          {r.status === "APPROVED" && (
            <Button type="button" variant="primary" size="sm" onClick={() => setPayTarget(r)}>
              Pay
            </Button>
          )}
          {r.status === "PENDING" && <span className="text-xs text-muted-foreground">Awaiting principal approval</span>}
          {r.status === "PAID" && <span className="text-xs text-muted-foreground">Paid</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Payroll (Accountant)"
        breadCrumbItems={[{ title: "Accountant", link: "/accountant" }, { title: "Payroll", link: "/accountant/payroll/wizard" }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setGenerateOpen(true)}>
            Create Payroll
          </Button>
        }
      />

      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        Creates a month-level payroll (backend auto-generates payslips from salary structures/attendance). Submit DRAFT payrolls for principal approval; pay APPROVED payrolls with a BS paid date (posts journal and locks attendance).
      </p>

      <GenericTable
        tableHeads={head}
        data={rows}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        emptyTitle="No payrolls found."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search payrolls..."
      />

      {generateOpen && <PayrollFormDialog onClose={() => setGenerateOpen(false)} />}
      {payTarget && <PayPayrollDialog payroll={payTarget} onClose={() => setPayTarget(null)} />}
    </div>
  );
}

function PayPayrollDialog({ payroll, onClose }: { payroll: PayrollRow; onClose: () => void }) {
  const qc = useQueryClient();
  const form = useForm<PayPayrollValues>({
    resolver: zodResolver(payPayrollSchema),
    defaultValues: { paidDateBs: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: PayPayrollValues) => markPaid(payroll.id, { paidDateBs: values.paidDateBs }),
    onSuccess: () => {
      toast.success("Payroll marked as paid (journal posted, attendance locked).");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_PAYROLL] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_PAYROLL_PENDING] });
      onClose();
    },
    onError: (e: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(e, form.setError);
      toast.error(e.response?.data?.message ?? "Failed to pay payroll.");
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Payroll</DialogTitle>
          <DialogDescription>
            Mark {payroll.yearBs ?? "—"}/{monthLabel(payroll.monthBs)} as PAID. Backend posts the payroll journal and locks the month&apos;s employee attendance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <FormField
              control={form.control}
              name="paidDateBs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid Date (BS)</FormLabel>
                  <FormControl>
                    <BsDatePicker
                      value={field.value ?? ""}
                      valueFormat="bs"
                      lang="en"
                      placeholder="Select paid date (BS)"
                      onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                    />
                  </FormControl>
                  <FormDescription>Payment date in Bikram Sambat (YYYY-MM-DD).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={mutation.isPending}>
                Confirm Pay
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
