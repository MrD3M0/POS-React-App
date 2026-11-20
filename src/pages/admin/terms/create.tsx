import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { InputWithSwitch } from "@/components/input-with-switch";
import PageHeader from "@/components/common/page-header";
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
import { createTerm, listTerms } from "./service/service";
import { termDefaultValues, termSchema, type TermFormValues } from "./schema/schema";
import { listBatches } from "@/pages/admin/batches/service/service";

export default function CreateTermPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const batchesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, "select", "unlimited"],
    queryFn: () => listBatches({ page: 1, limit: -1 }),
  });

  const batches = batchesQuery.data?.data?.data ?? [];
  const batchOptions = batches.map((b) => ({
    label: `${b.name}${b.course ? ` (${b.course.code})` : ""}`,
    value: b.id,
    searchValues: `${b.name} ${b.course?.code ?? ""} ${b.course?.name ?? ""}`,
  }));

  const form = useForm<TermFormValues>({
    resolver: zodResolver(termSchema),
    defaultValues: termDefaultValues,
  });

  // A batch automatically gets ALL of its terms (Semester/Year 1..N) when it
  // is created, so a manual term number for that batch is almost always a
  // duplicate. Show the numbers that already exist and flag duplicates inline
  // instead of letting the backend 409 after submit.
  const batchId = form.watch("batchId");
  const termNumber = form.watch("termNumber");

  const termsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TERM_LIST, batchId],
    queryFn: () => listTerms({ page: 1, limit: -1, batchId }),
    enabled: !!batchId,
  });

  const existingNumbers = useMemo(
    () =>
      (termsQuery.data?.data?.data ?? [])
        .map((t) => t.termNumber)
        .sort((a, b) => a - b),
    [termsQuery.data],
  );

  const isDuplicate = termNumber != null && existingNumbers.includes(termNumber);

  useEffect(() => {
    if (isDuplicate) {
      form.setError("termNumber", {
        message: `Term #${termNumber} already exists for this batch — terms are created automatically when the batch is created.`,
      });
    } else if (
      form.getFieldState("termNumber").error?.message?.includes("already exists")
    ) {
      form.clearErrors("termNumber");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDuplicate, termNumber, batchId]);

  const mutation = useMutation({
    mutationFn: (data: TermFormValues) =>
      createTerm({
        batchId: data.batchId,
        termNumber: data.termNumber,
        name: data.name.trim(),
        startDateBs: data.startDateBs?.trim() || null,
        endDateBs: data.endDateBs?.trim() || null,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      toast.success("Term created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_TERM_LIST] });
      navigate("/admin/terms");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create term.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Create Term"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Terms", link: "/admin/terms" },
          { title: "Create", link: "/admin/terms/create" },
        ]}
        backPage="/admin/terms"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={field.onChange}
                      options={batchOptions}
                      placeholder={batchesQuery.isLoading ? "Loading batches..." : "Select a batch"}
                      searchPlaceholder="Search batches..."
                      loading={batchesQuery.isLoading}
                    />
                  </FormControl>
                  <FormDescription>Select the batch this term belongs to.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="termNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={field.value ?? ""}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(e) => {
                          const num = Number(e.target.value);
                          field.onChange(num);
                          // Auto-fill the name from the course system, but
                          // only for a real number (never "Semester 0").
                          const system = batches.find(
                            (b) => b.id === form.getValues("batchId"),
                          )?.course?.system;
                          const unit = system === "YEARLY" ? "Year" : "Semester";
                          if (num >= 1 && !form.getValues("name")) {
                            form.setValue("name", `${unit} ${num}`);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {existingNumbers.length > 0
                        ? `This batch already has terms #${existingNumbers.join(", #")} — they are created automatically when the batch is created.`
                        : "Sequential semester/year number within the batch."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Semester 1" {...field} />
                    </FormControl>
                    <FormDescription>Display name shown in schedules and reports.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Start Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="Select start date"
                        onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Optional term start date in BS.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>End Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="Select end date"
                        onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Optional term end date in BS.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <InputWithSwitch
                      value={field.value}
                      onChange={field.onChange}
                      labels={{ on: "Active", off: "Inactive" }}
                    />
                  </FormControl>
                  <FormDescription>Inactive terms are hidden from normal selection flows.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/terms">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Create Term
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
