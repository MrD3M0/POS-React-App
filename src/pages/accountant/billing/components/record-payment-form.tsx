import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import { compareBs, formatBs, parseBs, todayBs } from "@/lib/bs-date";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import {
  createFeePayment,
  listBatchTerms,
  listFeePayments,
  listPaymentMethods,
  listStudentFees,
  listStudents,
  studentFullName,
  type T_BatchTerm,
  type T_BillingStudent,
  type T_FeePayment,
  type T_PaymentMethod,
  type T_StudentFee,
  type T_StudentFeeItem,
} from "../service/service";
import {
  billingPaymentDefaultValues,
  createBillingPaymentSchema,
  type BillingPaymentFormValues,
} from "../schema/schema";

function rowsFromList(data: unknown): unknown[] {
  const raw = data as { data?: unknown };
  if (Array.isArray(raw?.data)) return raw.data;
  const nested = raw?.data as { data?: unknown[] } | undefined;
  if (nested && Array.isArray(nested.data)) return nested.data;
  return [];
}

/** Indian-style thousands separators (lakh grouping), the convention in Nepal. */
const amountFormat = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? amountFormat.format(n) : "0.00";
}

function parseAmount(value: string): number {
  const n = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

/** Reference/cheque number is only relevant for bank-like methods. */
function needsReference(method?: T_PaymentMethod | null): boolean {
  if (!method) return false;
  return /bank|cheque/i.test(`${method.code} ${method.name}`);
}

/** Oldest / first-due fee item first, items without a due date last. */
function sortByDueDate(items: T_StudentFeeItem[]): T_StudentFeeItem[] {
  return [...items].sort((a, b) => {
    const da = a.dueDateBs ? parseBs(a.dueDateBs) : null;
    const db = b.dueDateBs ? parseBs(b.dueDateBs) : null;
    if (da && db) return compareBs(da, db);
    if (da) return -1;
    if (db) return 1;
    return 0;
  });
}

/**
 * Amount input that keeps its own text while the user is typing.
 * - Focus: shows the raw number (e.g. "5000") so typing/backspace works normally.
 * - Blur: formats it nicely (e.g. "5,000.00").
 * - External changes ("Pay full due", form reset) sync in only while not focused.
 */
function AmountInput({
  value,
  onChange,
  onBlur,
}: {
  value: number;
  onChange: (n: number) => void;
  onBlur: () => void;
}) {
  const [text, setText] = useState(value ? formatAmount(value) : "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(value ? formatAmount(value) : "");
  }, [value, focused]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      className="h-10 pl-10 text-right tabular-nums"
      placeholder="0.00"
      value={text}
      onFocus={() => {
        setFocused(true);
        setText(value ? String(value) : "");
      }}
      onChange={(e) => {
        // Digits and a single dot only, max 2 decimal places.
        const raw = e.target.value.replace(/[^\d.]/g, "");
        const [int, ...rest] = raw.split(".");
        const clean = rest.length ? `${int}.${rest.join("").slice(0, 2)}` : int;
        setText(clean);
        onChange(parseAmount(clean));
      }}
      onBlur={() => {
        setFocused(false);
        onBlur();
      }}
    />
  );
}

export default function RecordPaymentForm() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // The due cap depends on the selected student + term, so the schema is
  // rebuilt whenever due changes and read through a ref by the resolver.
  const schemaRef = useRef(
    createBillingPaymentSchema(Number.POSITIVE_INFINITY),
  );
  const form = useForm<BillingPaymentFormValues>({
    resolver: (values, context, options) =>
      zodResolver(schemaRef.current)(values, context, options),
    mode: "onChange",
    defaultValues: billingPaymentDefaultValues,
  });

  const studentId = useWatch({ control: form.control, name: "studentId" });
  const termNumber = useWatch({ control: form.control, name: "termNumber" });
  const paymentMethodId = useWatch({
    control: form.control,
    name: "paymentMethodId",
  });

  // ---------------------------------------------------------------
  //  Data: students, methods, and — once a student is picked — the
  //  student's assigned fees (with items), payment history, batch
  //  terms and the per-term fee summary.
  // ---------------------------------------------------------------
  const studentsQuery = useQuery({
    queryKey: [
      QUERY_KEYS.ACCOUNTANT_BILLING,
      "students",
      "approved",
      "unlimited",
    ],
    queryFn: () =>
      listStudents({ page: 1, limit: -1, approvalStatus: "APPROVED" }),
  });
  const methodQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING, "methods", "unlimited"],
    queryFn: () => listPaymentMethods({ page: 1, limit: -1 }),
  });

  const students = rowsFromList(studentsQuery.data) as T_BillingStudent[];
  const methods = rowsFromList(methodQuery.data) as T_PaymentMethod[];
  const selectedStudent = students.find((s) => s.id === studentId);

  const feesQuery = useQuery({
    queryKey: [
      QUERY_KEYS.ACCOUNTANT_BILLING,
      "student-fees",
      studentId,
      "unlimited",
    ],
    queryFn: () => listStudentFees({ page: 1, limit: -1, studentId }),
    enabled: !!studentId,
  });
  const paymentsQuery = useQuery({
    queryKey: [
      QUERY_KEYS.ACCOUNTANT_BILLING,
      "payments",
      studentId,
      "unlimited",
    ],
    queryFn: () => listFeePayments({ page: 1, limit: -1, studentId }),
    enabled: !!studentId,
  });
  const termsQuery = useQuery({
    queryKey: [
      QUERY_KEYS.ACCOUNTANT_BILLING,
      "batch-terms",
      selectedStudent?.batchId ?? "",
      "unlimited",
    ],
    queryFn: () =>
      listBatchTerms({ page: 1, limit: -1, batchId: selectedStudent?.batchId }),
    enabled: !!selectedStudent?.batchId,
  });

  const feesForStudent = rowsFromList(feesQuery.data) as T_StudentFee[];
  const payments = rowsFromList(paymentsQuery.data) as T_FeePayment[];
  const batchTerms = rowsFromList(termsQuery.data) as T_BatchTerm[];

  // Every payable item of the student across all assigned fees.
  const allItems = useMemo(
    () =>
      feesForStudent
        .flatMap((f) => f.items ?? [])
        .filter((it) => !it.isSkipped && it.termNumber),
    [feesForStudent],
  );
  // Term numbers that actually have a fee assigned.
  const feeTermNumbers = useMemo(
    () =>
      [...new Set(allItems.map((it) => it.termNumber as number))].sort(
        (a, b) => a - b,
      ),
    [allItems],
  );

  // Already-paid per fee item, across live (non-cancelled) payments.
  const paidByItem = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of payments) {
      if (p.isCancelled) continue;
      for (const al of p.allocations ?? []) {
        map.set(
          al.studentFeeItemId,
          (map.get(al.studentFeeItemId) ?? 0) + Number(al.amount || 0),
        );
      }
    }
    return map;
  }, [payments]);

  /** Fee summary for the selected term (paisa-exact). */
  const summary = useMemo(() => {
    const items = termNumber
      ? allItems.filter((it) => it.termNumber === Number(termNumber))
      : [];
    const totalFeePaisa = items.reduce(
      (s, it) => s + Math.round(Number(it.netAmount ?? it.amount ?? 0) * 100),
      0,
    );
    const paidPaisa = items.reduce(
      (s, it) =>
        s +
        Math.min(
          Math.round((paidByItem.get(it.id) ?? 0) * 100),
          Math.round(Number(it.netAmount ?? it.amount ?? 0) * 100),
        ),
      0,
    );
    return {
      items: sortByDueDate(items),
      totalFee: totalFeePaisa / 100,
      alreadyPaid: paidPaisa / 100,
      due: Math.max(0, totalFeePaisa - paidPaisa) / 100,
    };
  }, [termNumber, allItems, paidByItem]);

  const due = summary.due;

  // Keep the resolver's schema in sync with the current due (an effect, since
  // refs must not be written during render). Re-validate the amount only if
  // the user has already entered one, so untouched fields don't turn red.
  useEffect(() => {
    schemaRef.current = createBillingPaymentSchema(due);
    if (Number(form.getValues("amountPaid")) > 0) {
      form.trigger("amountPaid");
    }
  }, [due, form]);

  // Reset the term when the student changes (no validation: don't show
  // "required" on a field the user hasn't touched yet).
  useEffect(() => {
    if (!studentId) return;
    form.setValue("termNumber", "", { shouldValidate: false });
  }, [studentId, form]);

  // A different student/term has a different due — clear the amount.
  useEffect(() => {
    if (!studentId) return;
    form.resetField("amountPaid", {
      defaultValue: billingPaymentDefaultValues.amountPaid,
    });
  }, [studentId, termNumber, form]);

  // Default the payment date to today (BS).
  useEffect(() => {
    if (!form.getValues("paymentDateBs")) {
      form.setValue("paymentDateBs", formatBs(todayBs()), {
        shouldValidate: false,
      });
    }
  }, [form]);

  const studentOptions = [
    { label: "Select student", value: "" },
    ...students.map((s) => {
      const className = s.batch?.name ?? s.batch?.course?.code ?? "";
      return {
        label: `${studentFullName(s)}${className ? ` — ${className}` : ""} (${s.universityRegNo})`,
        value: s.id,
        searchValues: `${studentFullName(s)} ${className} ${s.universityRegNo}`,
      };
    }),
  ];
  // Only terms that have a fee assigned to this student; names come from the batch terms.
  const termOptions = [
    { label: "Select term", value: "" },
    ...feeTermNumbers.map((n) => {
      const term = batchTerms.find((t) => t.termNumber === n);
      return {
        label: term?.name ?? `Term ${n}`,
        value: String(n),
        searchValues: `${term?.name ?? ""} term ${n}`,
      };
    }),
  ];
  const methodOptions = [
    { label: "Select method", value: "" },
    ...methods.map((m) => ({
      label: `${m.name} (${m.code})`,
      value: m.id,
      searchValues: `${m.name} ${m.code}`,
    })),
  ];
  const selectedMethod = methods.find((m) => m.id === paymentMethodId);
  const showReference = needsReference(selectedMethod);

  const mutation = useMutation({
    mutationFn: (data: BillingPaymentFormValues) => {
      // Build the allocation payload automatically: oldest/first-due fee item
      // first, until the amount paid is used up. Paisa-exact so the sums match
      // the backend's Decimal checks.
      const amountPaisa = Math.round(data.amountPaid * 100);
      let remaining = amountPaisa;
      const allocations: { studentFeeItemId: string; amount: string }[] = [];
      for (const item of summary.items) {
        if (remaining <= 0) break;
        const netPaisa = Math.round(
          Number(item.netAmount ?? item.amount ?? 0) * 100,
        );
        const itemDuePaisa =
          netPaisa -
          Math.min(Math.round((paidByItem.get(item.id) ?? 0) * 100), netPaisa);
        if (itemDuePaisa <= 0) continue;
        const payPaisa = Math.min(itemDuePaisa, remaining);
        allocations.push({
          studentFeeItemId: item.id,
          amount: (payPaisa / 100).toFixed(2),
        });
        remaining -= payPaisa;
      }
      if (remaining > 0) {
        // Stale data guard: the amount exceeds what the term can absorb.
        return Promise.reject(
          new Error(
            `Amount exceeds the remaining due of Rs. ${formatAmount(summary.due)}. Refresh and try again.`,
          ),
        );
      }

      return createFeePayment({
        studentId: data.studentId,
        paymentDateBs: data.paymentDateBs,
        totalAmount: (amountPaisa / 100).toFixed(2),
        ...(data.receiptNo?.trim() ? { receiptNo: data.receiptNo.trim() } : {}),
        ...(data.remarks?.trim() ? { remarks: data.remarks.trim() } : {}),
        methodLines: [
          {
            paymentMethodId: data.paymentMethodId,
            amount: (amountPaisa / 100).toFixed(2),
            ...(showReference && data.referenceNo?.trim()
              ? { referenceNo: data.referenceNo.trim() }
              : {}),
          },
        ],
        allocations,
      });
    },
    onSuccess: (res) => {
      toast.success(res.message ?? "Payment created.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING] });
      qc.invalidateQueries({
        queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING_PAYMENTS],
      });
      form.reset({
        ...billingPaymentDefaultValues,
        paymentDateBs: formatBs(todayBs()),
      });
      const id = (res as { data?: { id?: string } })?.data?.id;
      if (id) navigate(`/accountant/billing/receipt/${id}`);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        mapFieldsOnError(error, form.setError);
        toast.error(
          error.response?.data?.message ?? "Failed to create payment.",
        );
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to create payment.",
        );
      }
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Student</FormLabel>
                <FormControl>
                  <SelectCommand
                    value={field.value}
                    onChange={field.onChange}
                    options={studentOptions}
                    placeholder={
                      studentsQuery.isLoading
                        ? "Loading students..."
                        : "Select student"
                    }
                    searchPlaceholder="Search students..."
                    loading={studentsQuery.isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Only approved students are listed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termNumber"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Term</FormLabel>
                <FormControl>
                  <SelectCommand
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={termOptions}
                    placeholder={
                      !studentId
                        ? "Select a student first"
                        : feesQuery.isLoading
                          ? "Loading terms..."
                          : "Select term"
                    }
                    searchPlaceholder="Search terms..."
                    loading={feesQuery.isLoading}
                    disabled={!studentId}
                    withClear
                  />
                </FormControl>
                <FormDescription>
                  Only terms with an assigned fee are listed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {studentId && termNumber && (
            <div className="grid grid-cols-3 gap-3 rounded-md border border-border bg-muted/40 p-3 md:col-span-2">
              <div>
                <p className="text-xs text-muted-foreground">Total Fee</p>
                <p className="font-medium tabular-nums">
                  Rs. {formatAmount(summary.totalFee)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Already Paid</p>
                <p className="font-medium tabular-nums">
                  Rs. {formatAmount(summary.alreadyPaid)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Due Amount</p>
                <p className="text-base font-semibold tabular-nums">
                  Rs. {formatAmount(summary.due)}
                </p>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="amountPaid"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Amount Paid</FormLabel>
                  {due > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs text-primary hover:text-primary hover:underline"
                      onClick={() =>
                        form.setValue("amountPaid", due, {
                          shouldValidate: true,
                        })
                      }
                    >
                      Pay full due
                    </Button>
                  ) : null}
                </div>
                <FormControl>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                      Rs.
                    </span>
                    <AmountInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethodId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <SelectCommand
                    value={field.value}
                    onChange={field.onChange}
                    options={methodOptions}
                    placeholder={
                      methodQuery.isLoading
                        ? "Loading methods..."
                        : "Select method"
                    }
                    searchPlaceholder="Search methods..."
                    loading={methodQuery.isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showReference && (
            <FormField
              control={form.control}
              name="referenceNo"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel isOptional>Reference / Cheque No.</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Reference or cheque number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="paymentDateBs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Date (BS)</FormLabel>
                <FormControl>
                  <BsDatePicker
                    value={field.value ?? ""}
                    valueFormat="bs"
                    lang="en"
                    placeholder="Select BS date"
                    onChange={(v) =>
                      field.onChange(typeof v === "string" ? v : "")
                    }
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormDescription>Date in Bikram Sambat.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receiptNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel isOptional>Receipt No.</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Auto if blank"
                  />
                </FormControl>
                <FormDescription>Leave blank to auto-generate.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel isOptional>Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    className="resize-none"
                    placeholder="Optional notes..."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/accountant/billing/payments")}
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={mutation.isPending}
            disabled={!form.formState.isValid || mutation.isPending}
          >
            {mutation.isPending ? "Submitting..." : "Submit Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
