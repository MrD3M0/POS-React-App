import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { mapFieldsOnError } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/query-keys";
import PageHeader from "@/components/common/page-header";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { listFiscalYears, listPaymentMethods, listStudents } from "@/pages/accountant/service-utils";
import { createFeePayment, listStudentFeesByStudent } from "./service/service";
import {
  createFeePaymentDefaultValues,
  createFeePaymentSchema,
  defaultAllocation,
  defaultMethodLine,
  type CreateFeePaymentFormValues,
} from "./schema/schema";

function money(v: unknown) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export default function CreateAccountantPaymentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const createForm = useForm<CreateFeePaymentFormValues>({
    resolver: zodResolver(createFeePaymentSchema),
    defaultValues: createFeePaymentDefaultValues,
  });
  const methodArray = useFieldArray({ control: createForm.control, name: "methodLines" });
  const allocArray = useFieldArray({ control: createForm.control, name: "allocations" });

  const studentId = createForm.watch("studentId");
  const methodLines = createForm.watch("methodLines") ?? [];
  const allocations = createForm.watch("allocations") ?? [];

  useEffect(() => {
    // When student changes, reset allocations to avoid allocating another student's items.
    createForm.setValue("allocations", [defaultAllocation()], { shouldValidate: false });
  }, [studentId, createForm]);

  const studentsQuery = useQuery({
    queryKey: ["accountant-students", "unlimited"],
    queryFn: () => listStudents({ page: 1, limit: -1 }),
  });
  const fiscalYearsQuery = useQuery({
    queryKey: ["accountant-fiscal-years", "unlimited"],
    queryFn: () => listFiscalYears({ page: 1, limit: -1 }),
  });
  const paymentMethodsQuery = useQuery({
    queryKey: ["accountant-payment-methods", "unlimited"],
    queryFn: () => listPaymentMethods({ page: 1, limit: -1 }),
  });
  const studentFeesQuery = useQuery({
    queryKey: ["accountant-student-fees", studentId, "unlimited"],
    queryFn: () => listStudentFeesByStudent(studentId),
    enabled: Boolean(studentId),
  });

  const studentOptions = (studentsQuery.data?.data?.data ?? []).map((s) => {
    const name = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
    return { label: `${name} (${s.universityRegNo})`, value: s.id, searchValues: `${name} ${s.universityRegNo}` };
  });
  const fiscalYearOptions = [
    { label: "Current / default (server)", value: "" },
    ...(fiscalYearsQuery.data?.data?.data ?? []).map((fy) => ({
      label: `${fy.name}${fy.isCurrent ? " (Current)" : ""}${fy.isClosed ? " (Closed)" : ""}`,
      value: fy.id,
      searchValues: `${fy.name} ${fy.startDateBs} ${fy.endDateBs}`,
    })),
  ];
  const paymentMethodOptions = (paymentMethodsQuery.data?.data?.data ?? [])
    .filter((m) => m.isActive !== false)
    .map((m) => ({ label: [m.code, m.name].filter(Boolean).join(" - "), value: m.id, searchValues: `${m.code} ${m.name}` }));

  const feeItemOptions = (studentFeesQuery.data?.data?.data ?? []).flatMap((fee) => {
    const structure = [fee.feeStructure?.courseName, fee.feeStructure?.termLabel].filter(Boolean).join(" / ");
    return (fee.items ?? [])
      .filter((it) => !it.isSkipped)
      .map((it) => {
        const head = [it.feeHead?.code, it.feeHead?.name].filter(Boolean).join(" - ") || it.feeHeadId || it.id;
        const net = money(it.netAmount ?? it.amount);
        return {
          label: `${head} • Net ${net.toFixed(2)}${it.termNumber ? ` • Term ${it.termNumber}` : ""}${structure ? ` • ${structure}` : ""}`,
          value: it.id,
          searchValues: `${head} ${structure} ${it.termNumber ?? ""}`,
        };
      });
  });

  const methodTotal = methodLines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const allocTotal = allocations.reduce((s, a) => s + Number(a.amount || 0), 0);
  const totalsMatch = Math.abs(methodTotal - allocTotal) < 0.0001 && methodTotal > 0;

  const createMutation = useMutation({
    mutationFn: (data: CreateFeePaymentFormValues) => createFeePayment(data),
    onSuccess: () => {
      toast.success("Fee payment recorded successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_PAYMENTS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_RECEIPTS] });
      navigate("/accountant/payments");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, createForm.setError);
      toast.error(error.response?.data?.message ?? "Failed to record fee payment.");
    },
  });

  const isPending = createMutation.isPending;

  return (
    <div className="p-5">
      <PageHeader
        title="New Payment"
        description="Record a fee payment against student fee items (method lines total must equal allocations total)."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Student Payments", link: "/accountant/payments" },
          { title: "New Payment", link: "/accountant/payments/create" },
        ]}
        backPage="/accountant/payments"
      />

      <div className="mt-4 w-full max-w-4xl">
        <Form {...createForm}>
          <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField control={createForm.control} name="studentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <FormControl>
                    <SelectCommand value={field.value} onChange={field.onChange} options={studentOptions} placeholder={studentsQuery.isLoading ? "Loading students..." : "Select student..."} searchPlaceholder="Search students..." loading={studentsQuery.isLoading} />
                  </FormControl>
                  <FormDescription>Student receiving this payment.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="fiscalYearId" render={({ field }) => (
                <FormItem>
                  <FormLabel isOptional>Fiscal Year</FormLabel>
                  <FormControl>
                    <SelectCommand value={field.value ?? ""} onChange={field.onChange} options={fiscalYearOptions} placeholder={fiscalYearsQuery.isLoading ? "Loading fiscal years..." : "Current / default (server)"} searchPlaceholder="Search fiscal years..." loading={fiscalYearsQuery.isLoading} withClear />
                  </FormControl>
                  <FormDescription>Optional fiscal year; the backend can resolve the current one.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="paymentDateBs" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date (BS)</FormLabel>
                  <FormControl>
                    <BsDatePicker value={field.value ?? ""} valueFormat="bs" lang="en" placeholder="Select BS date" onChange={(v) => field.onChange(typeof v === "string" ? v : "")} onBlur={field.onBlur} />
                  </FormControl>
                  <FormDescription>Payment date in Bikram Sambat.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="remarks" render={({ field }) => (
                <FormItem>
                  <FormLabel isOptional>Remarks</FormLabel>
                  <FormControl><Input placeholder="Optional remarks" {...field} value={field.value ?? ""} /></FormControl>
                  <FormDescription>Optional payment notes.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Payment Method Lines</div>
                <Button type="button" variant="secondary" size="sm" onClick={() => methodArray.append(defaultMethodLine())} disabled={isPending}>Add Method</Button>
              </div>
              <div className="space-y-3">
                {methodArray.fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 gap-3 rounded border p-3 md:grid-cols-12">
                    <div className="md:col-span-5">
                      <FormField control={createForm.control} name={`methodLines.${i}.paymentMethodId`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <FormControl><SelectCommand value={field.value} onChange={field.onChange} options={paymentMethodOptions} placeholder={paymentMethodsQuery.isLoading ? "Loading methods..." : "Select method..."} searchPlaceholder="Search methods..." loading={paymentMethodsQuery.isLoading} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-2">
                      <FormField control={createForm.control} name={`methodLines.${i}.amount`} render={({ field }) => (
                        <FormItem><FormLabel>Amount</FormLabel><FormControl><Input type="number" min={0} step="0.01" value={field.value ?? 0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-2">
                      <FormField control={createForm.control} name={`methodLines.${i}.referenceNo`} render={({ field }) => (
                        <FormItem><FormLabel isOptional>Ref No.</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-2">
                      <FormField control={createForm.control} name={`methodLines.${i}.bankName`} render={({ field }) => (
                        <FormItem><FormLabel isOptional>Bank</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="flex items-end md:col-span-1"><Button type="button" variant="outline" size="sm" onClick={() => methodArray.remove(i)} disabled={methodArray.fields.length <= 1 || isPending}>Remove</Button></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Allocations (Student Fee Items)</div>
                <Button type="button" variant="secondary" size="sm" onClick={() => allocArray.append(defaultAllocation())} disabled={isPending || !studentId}>Add Allocation</Button>
              </div>
              {!studentId ? (
                <p className="text-sm text-muted-foreground">Select a student to load allocatable fee items.</p>
              ) : studentFeesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading student fee items...</p>
              ) : feeItemOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No allocatable fee items found for this student. Assign a fee structure first.</p>
              ) : null}
              <div className="mt-2 space-y-3">
                {allocArray.fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 gap-3 rounded border p-3 md:grid-cols-12">
                    <div className="md:col-span-8">
                      <FormField control={createForm.control} name={`allocations.${i}.studentFeeItemId`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fee Item</FormLabel>
                          <FormControl><SelectCommand value={field.value} onChange={field.onChange} options={feeItemOptions} placeholder={studentFeesQuery.isLoading ? "Loading fee items..." : "Select fee item..."} searchPlaceholder="Search fee items..." loading={studentFeesQuery.isLoading} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-3">
                      <FormField control={createForm.control} name={`allocations.${i}.amount`} render={({ field }) => (
                        <FormItem><FormLabel>Allocated Amount</FormLabel><FormControl><Input type="number" min={0} step="0.01" value={field.value ?? 0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} /></FormControl><FormDescription>Must fit remaining due.</FormDescription><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="flex items-end md:col-span-1"><Button type="button" variant="outline" size="sm" onClick={() => allocArray.remove(i)} disabled={allocArray.fields.length <= 1 || isPending}>Remove</Button></div>
                  </div>
                ))}
              </div>
              {createForm.formState.errors.allocations?.message ? (
                <p className="mt-2 text-sm text-destructive">{String(createForm.formState.errors.allocations.message)}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded border bg-muted/20 p-3 text-sm">
              <span>Method total: <strong>{methodTotal.toFixed(2)}</strong></span>
              <span>Allocations total: <strong>{allocTotal.toFixed(2)}</strong></span>
              <span className={totalsMatch ? "text-emerald-600" : "text-destructive"}>Balanced: <strong>{totalsMatch ? "Yes" : "No"}</strong></span>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/accountant/payments")} disabled={isPending}>Cancel</Button>
              <Button type="submit" loading={isPending} disabled={!totalsMatch || isPending}>Record Payment</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
