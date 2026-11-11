import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import Button from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SelectCommand from "@/components/select-command";
import MultiSelect, {
  type T_MultiSelectOption,
} from "@/components/common/multi-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { listStudents } from "@/pages/admin/students/service/service";
import {
  listStudentFeeItems,
  listStudentFees,
  type T_StudentFee,
  type T_StudentFeeItem,
} from "@/pages/accountant/billing/service/service";
import {
  grantScholarship,
  listScholarships,
  type T_SCHOLARSHIP,
} from "../service/service";
import {
  grantScholarshipDefaultValues,
  grantScholarshipSchema,
  type GrantScholarshipValues,
} from "../schema/schema";

function rowsOf(raw: unknown): unknown[] {
  const r = raw as { data?: unknown };
  if (Array.isArray(r?.data)) return r.data;
  const inner = r?.data as { data?: unknown } | undefined;
  return Array.isArray(inner?.data) ? inner.data : [];
}

/** Grant a scholarship to a student: the discount lands on their fee items. */
export default function GrantScholarshipDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();

  const form = useForm<GrantScholarshipValues>({
    resolver: zodResolver(grantScholarshipSchema),
    defaultValues: grantScholarshipDefaultValues,
  });
  const studentId = useWatch({ control: form.control, name: "studentId" });
  const studentFeeId = useWatch({ control: form.control, name: "studentFeeId" });

  const scholarshipsQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_SCHOLARSHIPS, "options"],
    queryFn: () => listScholarships({ page: 1, limit: 999 }),
    enabled: open,
  });
  const studentsQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_STUDENT_OPTIONS],
    queryFn: () => listStudents({ page: 1, limit: 999 }),
    enabled: open,
  });
  const feesQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING, "student-fees", studentId, "unlimited"],
    queryFn: () => listStudentFees({ page: 1, limit: 999, studentId }),
    enabled: open && Boolean(studentId),
  });
  const itemsQuery = useQuery({
    queryKey: [
      QUERY_KEYS.ACCOUNTANT_BILLING,
      "fee-items",
      studentFeeId,
      "unlimited",
    ],
    queryFn: () => listStudentFeeItems({ page: 1, limit: 999, studentFeeId }),
    enabled: open && Boolean(studentFeeId),
  });

  useEffect(() => {
    if (!open) return;
    form.reset(grantScholarshipDefaultValues);
  }, [open, form]);

  const scholarshipOptions = useMemo(
    () =>
      (rowsOf(scholarshipsQuery.data) as T_SCHOLARSHIP[])
        .filter((item) => item.isActive)
        .map((item) => ({
          label: `${item.name}${
            item.type === "PERCENT" ? ` (${item.value}%)` : ` (NPR ${item.value})`
          }`,
          value: item.id,
        })),
    [scholarshipsQuery.data],
  );

  const studentOptions = useMemo(
    () =>
      (rowsOf(studentsQuery.data) as {
        id: string;
        universityRegNo?: string;
        firstName?: string;
        middleName?: string | null;
        lastName?: string;
      }[]).map((student) => ({
        label: `${student.universityRegNo ?? ""} — ${[student.firstName, student.middleName, student.lastName]
          .filter(Boolean)
          .join(" ")}`,
        value: student.id,
        searchValues: `${student.universityRegNo ?? ""} ${student.firstName ?? ""} ${student.lastName ?? ""}`,
      })),
    [studentsQuery.data],
  );

  const feeOptions = useMemo(
    () =>
      (rowsOf(feesQuery.data) as T_StudentFee[]).map((fee) => ({
        label: `${fee.feeStructure?.name ?? fee.feeStructure?.code ?? fee.id}`,
        value: fee.id,
      })),
    [feesQuery.data],
  );

  const feeItemOptions: T_MultiSelectOption[] = useMemo(
    () =>
      (rowsOf(itemsQuery.data) as T_StudentFeeItem[]).map((item) => ({
        label: `${item.feeHead?.name ?? "Fee item"} — NPR ${Number(item.amount ?? 0).toFixed(2)}`,
        value: item.id,
        description: item.isSkipped ? "Skipped" : undefined,
      })),
    [itemsQuery.data],
  );

  const mutation = useMutation({
    mutationFn: (values: GrantScholarshipValues) =>
      grantScholarship({
        scholarshipId: values.scholarshipId,
        studentId: values.studentId,
        studentFeeId: values.studentFeeId || undefined,
        feeItemIds: values.feeItemIds,
        note: values.note?.trim() || null,
      }),
    onSuccess: (data) => {
      const amount = (data?.data as { totalAmount?: string } | undefined)
        ?.totalAmount;
      toast.success(
        amount
          ? `Scholarship granted (NPR ${amount}).`
          : "Scholarship granted.",
      );
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_SCHOLARSHIPS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_SCHOLARSHIP_GRANTS] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING] });
      onOpenChange(false);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to grant the scholarship.",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Grant Scholarship</DialogTitle>
          <DialogDescription>
            The discount is applied to the student&apos;s fee items, so the
            dues drop immediately. Fees that already have payments cannot be
            changed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="scholarshipId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scholarship</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={field.onChange}
                      options={scholarshipOptions}
                      placeholder="Select scholarship..."
                      searchPlaceholder="Search scholarships..."
                      loading={scholarshipsQuery.isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        form.setValue("studentFeeId", "");
                        form.setValue("feeItemIds", []);
                      }}
                      options={studentOptions}
                      placeholder="Select student..."
                      searchPlaceholder="Search by name or reg no..."
                      loading={studentsQuery.isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Only students that already have a fee can get a
                    scholarship.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentFeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Fee</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        form.setValue("feeItemIds", []);
                      }}
                      options={feeOptions}
                      placeholder={
                        !studentId
                          ? "Select a student first"
                          : "Select fee..."
                      }
                      searchPlaceholder="Search fees..."
                      loading={feesQuery.isLoading}
                      disabled={!studentId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feeItemIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Items</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={feeItemOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={
                        !studentFeeId ? "Select a fee first" : "All fee items"
                      }
                      searchPlaceholder="Search fee items..."
                      loading={itemsQuery.isLoading}
                      disabled={!studentFeeId}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty to discount every not-skipped fee item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isOptional>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Top of the class, merit award 2081"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                Grant Scholarship
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
