import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { useCan } from "@/auth/use-can";
import { listMyClasses, type T_MY_CLASS } from "../my-classes/service/service";
import {
  createBatchPay,
  getBatchPayById,
  updateBatchPay,
  type T_TEACHER_BATCH_PAY,
} from "./service/service";
import { batchPaySchema, type BatchPayValues } from "./schema";
import { teachingAssignmentLabel } from "@/lib/teaching-assignment-label";

function toClassRows(raw: unknown): T_MY_CLASS[] {
  const r = raw as { data?: T_MY_CLASS[] | { data?: T_MY_CLASS[] } };
  return Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.data)
      ? r.data.data
      : [];
}

function toRecord(raw: unknown): T_TEACHER_BATCH_PAY | undefined {
  const r = raw as { data?: T_TEACHER_BATCH_PAY } | undefined;
  return r?.data;
}

/**
 * Full-page batch pay form (create + edit), matching the fee-structures
 * form-page pattern: header with breadcrumbs/back, 2-column grid, inline
 * field errors from the server, and a Cancel/submit footer.
 */
export default function BatchPayFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = Boolean(id);
  const canManage = useCan("teacher:batchPay:manage");

  const classesQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_MY_CLASSES, "unlimited"],
    queryFn: () => listMyClasses({ page: 1, limit: -1 }),
  });

  const recordQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_BATCH_PAY, id],
    queryFn: () => getBatchPayById(id as string),
    enabled: isEdit,
  });

  const form = useForm<BatchPayValues>({
    resolver: zodResolver(batchPaySchema),
    defaultValues: {
      teachingAssignmentId: "",
      ratePerCreditHour: "",
      fixedMonthlyAmount: "",
      effectiveFromBs: "",
      effectiveToBs: "",
    },
  });

  // In edit mode, fill the form once the record arrives.
  useEffect(() => {
    const record = toRecord(recordQuery.data);
    if (!isEdit || !record) return;
    form.reset({
      teachingAssignmentId: record.teachingAssignmentId ?? record.teachingAssignment?.id ?? "",
      ratePerCreditHour:
        record.ratePerCreditHour != null ? String(record.ratePerCreditHour) : "",
      fixedMonthlyAmount:
        record.fixedMonthlyAmount != null ? String(record.fixedMonthlyAmount) : "",
      effectiveFromBs: record.effectiveFromBs ?? "",
      effectiveToBs: record.effectiveToBs ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, recordQuery.data]);

  const mutation = useMutation({
    mutationFn: (values: BatchPayValues) => {
      const payload: Record<string, unknown> = {
        teachingAssignmentId: values.teachingAssignmentId,
        ratePerCreditHour: values.ratePerCreditHour ? Number(values.ratePerCreditHour) : null,
        fixedMonthlyAmount: values.fixedMonthlyAmount ? Number(values.fixedMonthlyAmount) : null,
        effectiveFromBs: values.effectiveFromBs,
        effectiveToBs: values.effectiveToBs || null,
      };
      return isEdit
        ? updateBatchPay(id as string, payload)
        : createBatchPay(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Batch pay updated." : "Batch pay created.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_BATCH_PAY] });
      navigate("/accountant/batch-pay");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to save the batch pay.");
    },
  });

  if (!canManage) return <Navigate to="/accountant/batch-pay" replace />;

  const classOptions = toClassRows(classesQuery.data).map((c) => ({
    label: teachingAssignmentLabel(c.teachingAssignment),
    value: c.id,
    searchValues: teachingAssignmentLabel(c.teachingAssignment),
  }));

  return (
    <div className="p-5">
      <PageHeader
        title={isEdit ? "Edit Batch Pay" : "Create Batch Pay"}
        description="Extra pay on top of base salary for a class, applied in payroll."
        breadCrumbItems={[
          { title: "Batch Pay", link: "/accountant/batch-pay" },
          { title: isEdit ? "Edit" : "Create", link: isEdit ? `/accountant/batch-pay/${id}/edit` : "/accountant/batch-pay/create" },
        ]}
        backPage="/accountant/batch-pay"
      />

      <div className="mt-4 w-full">
        {isEdit && recordQuery.isLoading ? (
          <ScreenLoader />
        ) : isEdit && recordQuery.isError ? (
          <p className="text-sm text-destructive">Failed to load the batch pay.</p>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="teachingAssignmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teaching Assignment *</FormLabel>
                      <FormControl>
                        <SelectCommand
                          value={field.value}
                          onChange={field.onChange}
                          options={classOptions}
                          placeholder={classesQuery.isLoading ? "Loading classes..." : "Select class"}
                          searchPlaceholder="Search classes..."
                          loading={classesQuery.isLoading}
                        />
                      </FormControl>
                      <FormDescription>Select the teaching assignment/class.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ratePerCreditHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isOptional>Rate per Credit Hour</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          placeholder="Rate per credit hour..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>Optional rate; provide this or fixed monthly amount.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fixedMonthlyAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isOptional>Fixed Monthly Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          placeholder="Fixed monthly amount..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>Optional fixed amount; provide this or rate per credit hour.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveFromBs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective From (BS) *</FormLabel>
                      <FormControl>
                        <BsDatePicker
                          value={field.value}
                          onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                          valueFormat="bs"
                          lang="en"
                          placeholder="Select start date (BS)"
                        />
                      </FormControl>
                      <FormDescription>Effective start date in Bikram Sambat.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveToBs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isOptional>Effective To (BS)</FormLabel>
                      <FormControl>
                        <BsDatePicker
                          value={field.value ?? ""}
                          onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                          valueFormat="bs"
                          lang="en"
                          placeholder="Select end date (BS)"
                          clearable
                        />
                      </FormControl>
                      <FormDescription>Optional effective end date in BS.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Link to="/accountant/batch-pay">
                  <Button type="button" variant="secondary" disabled={mutation.isPending}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" variant="primary" loading={mutation.isPending} disabled={mutation.isPending}>
                  {isEdit ? "Save Changes" : "Create Batch Pay"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
