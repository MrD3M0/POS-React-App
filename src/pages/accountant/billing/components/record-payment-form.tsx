import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import type { T_UseQueryError } from "@/types/common";
import {
  createFeePayment,
  listFiscalYears,
  listPaymentMethods,
  listStudentFeeItems,
  listStudentFees,
  listStudents,
  studentFeeNetTotal,
  studentFullName,
  type T_BillingStudent,
  type T_FiscalYear,
  type T_PaymentMethod,
  type T_StudentFee,
  type T_StudentFeeItem,
} from "../service/service";
import { billingPaymentDefaultValues, billingPaymentSchema, type BillingPaymentFormValues } from "../schema/schema";

function rowsFromList(data: unknown): unknown[] {
  const raw = data as { data?: unknown };
  if (Array.isArray(raw?.data)) return raw.data;
  const nested = raw?.data as { data?: unknown[] } | undefined;
  if (nested && Array.isArray(nested.data)) return nested.data;
  return [];
}

export default function RecordPaymentForm() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<BillingPaymentFormValues>({
    resolver: zodResolver(billingPaymentSchema),
    defaultValues: billingPaymentDefaultValues,
  });

  const methodArray = useFieldArray({ control: form.control, name: "methodLines" });
  const allocArray = useFieldArray({ control: form.control, name: "allocations" });

  const studentId = useWatch({ control: form.control, name: "studentId" });
  const studentFeeId = useWatch({ control: form.control, name: "studentFeeId" });
  const methodLines = useWatch({ control: form.control, name: "methodLines" }) ?? [];
  const allocations = useWatch({ control: form.control, name: "allocations" }) ?? [];
  const totalAmount = useWatch({ control: form.control, name: "totalAmount" }) ?? 0;

  useEffect(() => {
    form.setValue("studentFeeId", "", { shouldValidate: false });
    form.setValue("allocations", [{ studentFeeItemId: "", amount: 0 }], { shouldValidate: false });
  }, [studentId, form]);

  const studentQuery = useQuery({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING, "students", "unlimited"], queryFn: () => listStudents({ page: 1, limit: -1 }) });
  const fiscalQuery = useQuery({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING, "fiscal-years", "unlimited"], queryFn: () => listFiscalYears({ page: 1, limit: -1 }) });
  const methodQuery = useQuery({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING, "methods", "unlimited"], queryFn: () => listPaymentMethods({ page: 1, limit: -1 }) });
  const studentFeesQuery = useQuery({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING, "student-fees", studentId, "unlimited"], queryFn: () => listStudentFees({ page: 1, limit: -1, studentId }), enabled: !!studentId });
  const feeItemsQuery = useQuery({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING, "fee-items", studentFeeId, "unlimited"], queryFn: () => listStudentFeeItems({ page: 1, limit: -1, studentFeeId }), enabled: !!studentFeeId });

  const students = rowsFromList(studentQuery.data) as T_BillingStudent[];
  const fiscalYears = rowsFromList(fiscalQuery.data) as T_FiscalYear[];
  const methods = rowsFromList(methodQuery.data) as T_PaymentMethod[];
  const feesForStudent = rowsFromList(studentFeesQuery.data) as T_StudentFee[];
  const feeItems = rowsFromList(feeItemsQuery.data) as T_StudentFeeItem[];

  const studentOptions = [{ label: "Select student", value: "" }, ...students.map((s) => ({ label: `${studentFullName(s)} (${s.universityRegNo})`, value: s.id, searchValues: `${studentFullName(s)} ${s.universityRegNo}` }))];
  const fiscalYearOptions = [{ label: "Select fiscal year", value: "" }, ...fiscalYears.map((f) => ({ label: f.name || f.id, value: f.id, searchValues: f.name ?? "" }))];
  const studentFeeOptions = [{ label: "Select student fee", value: "" }, ...feesForStudent.map((f) => ({ label: `${f.feeStructure?.name ?? f.feeStructure?.code ?? f.id} — Rs. ${studentFeeNetTotal(f).toFixed(2)}`, value: f.id, searchValues: `${f.feeStructure?.name ?? ""} ${f.feeStructure?.code ?? ""}` }))];
  const methodOptions = [{ label: "Method", value: "" }, ...methods.map((m) => ({ label: `${m.name} (${m.code})`, value: m.id, searchValues: `${m.name} ${m.code}` }))];
  const feeItemOptions = [{ label: "Fee item", value: "" }, ...feeItems.map((it) => ({ label: `${it.feeHead?.name ?? it.description ?? it.id} — Rs. ${Number(it.netAmount ?? it.amount ?? 0).toFixed(2)}`, value: it.id, searchValues: `${it.feeHead?.name ?? ""} ${it.description ?? ""}` }))];

  const methodSum = methodLines.reduce((a, m) => a + Number(m.amount || 0), 0);
  const allocSum = allocations.reduce((a, m) => a + Number(m.amount || 0), 0);
  const totalNum = Number(totalAmount || 0);

  const mutation = useMutation({
    mutationFn: (data: BillingPaymentFormValues) =>
      createFeePayment({
        studentId: data.studentId,
        fiscalYearId: data.fiscalYearId,
        paymentDateBs: data.paymentDateBs,
        totalAmount: String(data.totalAmount),
        ...(data.receiptNo?.trim() ? { receiptNo: data.receiptNo.trim() } : {}),
        ...(data.remarks?.trim() ? { remarks: data.remarks.trim() } : {}),
        methodLines: data.methodLines.map((m) => ({
          paymentMethodId: m.paymentMethodId,
          amount: String(m.amount),
          referenceNo: m.referenceNo?.trim() || undefined,
          bankName: m.bankName?.trim() || undefined,
        })),
        allocations: data.allocations
          .filter((a) => a.studentFeeItemId)
          .map((a) => ({ studentFeeItemId: a.studentFeeItemId, amount: String(a.amount) })),
      }),
    onSuccess: (res) => {
      toast.success(res.message ?? "Payment created.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING_PAYMENTS] });
      form.reset(billingPaymentDefaultValues);
      const id = (res as { data?: { id?: string } })?.data?.id;
      if (id) navigate(`/accountant/billing/receipt/${id}`);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create payment.");
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <FormField control={form.control} name="studentId" render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <FormControl><SelectCommand value={field.value} onChange={field.onChange} options={studentOptions} placeholder={studentQuery.isLoading ? "Loading students..." : "Select student"} searchPlaceholder="Search students..." loading={studentQuery.isLoading} /></FormControl>
              <FormDescription>Select the student (ID reference, unlimited options).</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fiscalYearId" render={({ field }) => (
            <FormItem>
              <FormLabel>Fiscal Year</FormLabel>
              <FormControl><SelectCommand value={field.value} onChange={field.onChange} options={fiscalYearOptions} placeholder={fiscalQuery.isLoading ? "Loading fiscal years..." : "Select fiscal year"} searchPlaceholder="Search fiscal years..." loading={fiscalQuery.isLoading} /></FormControl>
              <FormDescription>Fiscal year for this payment (ID reference, unlimited).</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="studentFeeId" render={({ field }) => (
            <FormItem>
              <FormLabel isOptional>Student Fee (for items)</FormLabel>
              <FormControl><SelectCommand value={field.value ?? ""} onChange={field.onChange} options={studentFeeOptions} placeholder={!studentId ? "Select student first" : studentFeesQuery.isLoading ? "Loading fees..." : "Select student fee"} searchPlaceholder="Search fees..." loading={studentFeesQuery.isLoading} disabled={!studentId} withClear /></FormControl>
              <FormDescription>Optional: choose assigned fee to load allocatable items.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="receiptNo" render={({ field }) => (
              <FormItem><FormLabel isOptional>Receipt No.</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="Auto if blank" /></FormControl><FormDescription>Leave blank to auto-generate.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="paymentDateBs" render={({ field }) => (
              <FormItem><FormLabel>Payment Date (BS)</FormLabel><FormControl><BsDatePicker value={field.value ?? ""} valueFormat="bs" lang="en" placeholder="Select BS date" onChange={(v) => field.onChange(typeof v === "string" ? v : "")} onBlur={field.onBlur} /></FormControl><FormDescription>Date in Bikram Sambat.</FormDescription><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="totalAmount" render={({ field }) => (
            <FormItem><FormLabel>Total Amount</FormLabel><FormControl><Input type="number" min="0" step="0.01" value={field.value ?? 0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} placeholder="Total" /></FormControl><FormDescription>Must equal method lines and allocations totals.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="remarks" render={({ field }) => (
            <FormItem><FormLabel isOptional>Remarks</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="Remarks (optional)" /></FormControl><FormDescription>Optional notes.</FormDescription><FormMessage /></FormItem>
          )} />
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">Method Lines</span><Button type="button" size="sm" variant="outline" onClick={() => methodArray.append({ paymentMethodId: "", amount: 0, referenceNo: "", bankName: "" })}>Add</Button></div>
            <div className="space-y-2">
              {methodArray.fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-[1fr_110px_40px] items-start gap-2">
                  <FormField control={form.control} name={`methodLines.${i}.paymentMethodId`} render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Payment Method</FormLabel><FormControl><SelectCommand value={field.value} onChange={field.onChange} options={methodOptions} placeholder={methodQuery.isLoading ? "Loading..." : "Method"} searchPlaceholder="Search methods..." loading={methodQuery.isLoading} /></FormControl><FormDescription className="sr-only">Payment method (ID reference, unlimited options).</FormDescription><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`methodLines.${i}.amount`} render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Amount</FormLabel><FormControl><Input type="number" min="0" step="0.01" placeholder="Amount" value={field.value ?? 0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} /></FormControl><FormDescription className="sr-only">Amount for this payment method.</FormDescription><FormMessage /></FormItem>
                  )} />
                  <Button type="button" size="sm" variant="ghost" disabled={methodArray.fields.length === 1} onClick={() => methodArray.remove(i)}>×</Button>
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Method sum: Rs. {methodSum.toFixed(2)} / Total: Rs. {totalNum.toFixed(2)}</p>
            {form.formState.errors.methodLines?.message ? <p className="text-xs text-destructive">{String(form.formState.errors.methodLines.message)}</p> : null}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">Allocations</span><Button type="button" size="sm" variant="outline" onClick={() => allocArray.append({ studentFeeItemId: "", amount: 0 })}>Add</Button></div>
            <div className="space-y-2">
              {allocArray.fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-[1fr_110px_40px] items-start gap-2">
                  <FormField control={form.control} name={`allocations.${i}.studentFeeItemId`} render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Fee item</FormLabel><FormControl><SelectCommand value={field.value} onChange={field.onChange} options={feeItemOptions} placeholder={!studentFeeId ? "Select student fee first" : feeItemsQuery.isLoading ? "Loading..." : "Fee item"} searchPlaceholder="Search fee items..." loading={feeItemsQuery.isLoading} disabled={!studentFeeId} /></FormControl><FormDescription className="sr-only">Student fee item to allocate (ID reference).</FormDescription><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`allocations.${i}.amount`} render={({ field }) => (
                    <FormItem><FormLabel className="sr-only">Amount</FormLabel><FormControl><Input type="number" min="0" step="0.01" placeholder="Amount" value={field.value ?? 0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} /></FormControl><FormDescription className="sr-only">Allocated amount for this fee item.</FormDescription><FormMessage /></FormItem>
                  )} />
                  <Button type="button" size="sm" variant="ghost" disabled={allocArray.fields.length === 1} onClick={() => allocArray.remove(i)}>×</Button>
                </div>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Allocation sum: Rs. {allocSum.toFixed(2)} / Total: Rs. {totalNum.toFixed(2)}</p>
            {form.formState.errors.allocations?.message ? <p className="text-xs text-destructive">{String(form.formState.errors.allocations.message)}</p> : null}
          </div>

          <Button type="submit" loading={mutation.isPending} disabled={mutation.isPending}>Submit Payment</Button>
        </div>
      </form>
    </Form>
  );
}
