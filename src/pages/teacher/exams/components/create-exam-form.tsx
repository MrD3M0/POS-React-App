import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { BsDatePicker } from "@/components/bs-datepicker";
import SelectCommand from "@/components/select-command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { listTerms, type T_TERM } from "@/pages/admin/terms/service/service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { listExamTypes, type T_EXAM_TYPE } from "../service/service";
import { examSchema, type ExamValues } from "../schema";

function toRows<T>(raw: unknown): T[] {
  const r = raw as { data?: T[] | { data?: T[] } };
  if (Array.isArray(r?.data)) return r.data;
  return Array.isArray(r?.data?.data) ? r.data.data : [];
}

function termLabel(t: T_TERM): string {
  return [t.name, t.termNumber != null ? `Term ${t.termNumber}` : null].filter(Boolean).join(" — ") || t.id;
}

export default function CreateExamForm({
  isPending,
  onCancel,
  onSubmit,
}: {
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const form = useForm<ExamValues>({
    resolver: zodResolver(examSchema),
    defaultValues: { batchTermId: "", examTypeId: "", name: "", startDateBs: "", endDateBs: "" },
  });

  const termsQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAMS, "term-options", "unlimited"],
    queryFn: () => listTerms({ page: 1, limit: -1, isActive: true }),
  });
  const examTypesQuery = useQuery({
    queryKey: [QUERY_KEYS.TEACHER_EXAMS, "exam-type-options", "unlimited"],
    queryFn: () => listExamTypes({ page: 1, limit: -1 }),
  });

  const termOptions = useMemo(() => toRows<T_TERM>(termsQuery.data).map((t) => ({ label: termLabel(t), value: t.id, searchValues: termLabel(t) })), [termsQuery.data]);
  const examTypeOptions = useMemo(() => toRows<T_EXAM_TYPE>(examTypesQuery.data).map((t) => ({ label: t.name, value: t.id, searchValues: t.name })), [examTypesQuery.data]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) =>
          onSubmit({
            batchTermId: v.batchTermId,
            examTypeId: v.examTypeId,
            name: v.name.trim(),
            startDateBs: v.startDateBs || undefined,
            endDateBs: v.endDateBs || undefined,
          }),
        )}
        className="space-y-4 w-full"
      >
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="md:col-span-2"><FormLabel>Exam Name</FormLabel><FormControl><Input placeholder="Exam name..." {...field} /></FormControl><FormDescription>Display name for the exam.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="batchTermId" render={({ field }) => (
            <FormItem><FormLabel>Batch Term</FormLabel><FormControl>
              <SelectCommand value={field.value} onChange={field.onChange} options={termOptions} placeholder={termsQuery.isLoading ? "Loading terms..." : "Select batch term..."} searchPlaceholder="Search terms..." loading={termsQuery.isLoading} />
            </FormControl><FormDescription>Select batch term (ID reference, unlimited options).</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="examTypeId" render={({ field }) => (
            <FormItem><FormLabel>Exam Type</FormLabel><FormControl>
              <SelectCommand value={field.value} onChange={field.onChange} options={examTypeOptions} placeholder={examTypesQuery.isLoading ? "Loading exam types..." : "Select exam type..."} searchPlaceholder="Search exam types..." loading={examTypesQuery.isLoading} />
            </FormControl><FormDescription>Select exam type (ID reference, unlimited options).</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="startDateBs" render={({ field }) => (
            <FormItem><FormLabel isOptional>Start Date (BS)</FormLabel><FormControl>
              <BsDatePicker value={field.value ?? ""} onChange={(v) => field.onChange(typeof v === "string" ? v : "")} valueFormat="bs" lang="en" clearable />
            </FormControl><FormDescription>Optional start date in Bikram Sambat.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="endDateBs" render={({ field }) => (
            <FormItem><FormLabel isOptional>End Date (BS)</FormLabel><FormControl>
              <BsDatePicker value={field.value ?? ""} onChange={(v) => field.onChange(typeof v === "string" ? v : "")} valueFormat="bs" lang="en" clearable />
            </FormControl><FormDescription>Optional end date in BS (on or after start).</FormDescription><FormMessage /></FormItem>
          )} />
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending}>Create Exam</Button>
        </div>
      </form>
    </Form>
  );
}
