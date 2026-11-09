import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import SelectCommand from "@/components/select-command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import type { T_UseQueryError } from "@/types/common";
import { generatePayroll, listFiscalYears } from "../service/service";
import { BS_MONTH_OPTIONS, generatePayrollSchema, type GeneratePayrollValues } from "../schema";

interface PayrollFormDialogProps {
  onClose: () => void;
  month?: string;
}

export default function PayrollFormDialog({ onClose }: PayrollFormDialogProps) {
  const qc = useQueryClient();
  const fiscalQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FISCAL_YEAR_LIST, "payroll-wizard", "unlimited"],
    queryFn: () => listFiscalYears({ page: 1, limit: 999 }),
  });
  const fiscalYears: Array<{ id: string; name?: string; yearBs?: number; isCurrent?: boolean }> =
    (fiscalQuery.data?.data?.data ?? fiscalQuery.data?.data ?? []) as Array<{
      id: string;
      name?: string;
      yearBs?: number;
      isCurrent?: boolean;
    }>;

  const form = useForm<GeneratePayrollValues>({
    resolver: zodResolver(generatePayrollSchema),
    defaultValues: {
      fiscalYearId: "",
      yearBs: 2082,
      monthBs: 1,
      remarks: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: GeneratePayrollValues) =>
      generatePayroll({
        fiscalYearId: values.fiscalYearId,
        yearBs: Number(values.yearBs),
        monthBs: Number(values.monthBs),
        remarks: values.remarks || undefined,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_PAYROLL_WIZARD] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.PRINCIPAL_PAYROLL_PENDING] });
      const count = (data as { payslipsGenerated?: number })?.payslipsGenerated;
      toast.success(
        typeof count === "number"
          ? `Payroll created (DRAFT). ${count} payslip(s) generated.`
          : "Payroll created (DRAFT). Payslips generated.",
      );
      onClose();
    },
    onError: (e: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(e, form.setError);
      toast.error(e.response?.data?.message ?? "Failed to create payroll.");
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Payroll (BS Month)</DialogTitle>
          <DialogDescription>
            Creates a payroll for the selected fiscal year and BS month. Backend auto-generates payslips from salary structures and attendance (server-computed month days).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-3">
            <FormField
              control={form.control}
              name="fiscalYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiscal Year</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={field.onChange}
                      options={fiscalYears.map((fy) => ({
                        label: `${fy.name ?? fy.id}${fy.isCurrent ? " (current)" : ""}`,
                        value: fy.id,
                        searchValues: `${fy.name ?? ""} ${fy.yearBs ?? ""}`,
                      }))}
                      placeholder={fiscalQuery.isLoading ? "Loading fiscal years..." : "Select fiscal year..."}
                      searchPlaceholder="Search fiscal years..."
                      loading={fiscalQuery.isLoading}
                    />
                  </FormControl>
                  <FormDescription>Select fiscal year (ID reference, unlimited options).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="yearBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year (BS)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={2000}
                        max={2099}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                      />
                    </FormControl>
                    <FormDescription>BS year (e.g. 2082).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month (BS)</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value != null ? String(field.value) : ""}
                        onChange={(v) => field.onChange(v ? Number(v) : 1)}
                        options={BS_MONTH_OPTIONS}
                        placeholder="Select month..."
                        hideSearch
                      />
                    </FormControl>
                    <FormDescription>BS month (enum, fixed options).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isOptional>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional remarks..." value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value)} />
                  </FormControl>
                  <FormDescription>Optional notes for this payroll run.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={mutation.isPending}>
                Create Payroll
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
