import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { BsDatePicker } from "@/components/bs-datepicker";
import SelectCommand from "@/components/select-command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import type { T_EXAM } from "../../exams/service/service";
import type { T_BATCH_TERM_SUBJECT, T_EXAM_SUBJECT } from "../service/service";
import { examSubjectSchema, type ExamSubjectValues } from "../schema";

export default function EditExamSubjectForm({
  record,
  exams,
  btsList,
  examsLoading,
  btsLoading,
  isPending,
  onCancel,
  onSubmit,
}: {
  record: T_EXAM_SUBJECT;
  exams: T_EXAM[];
  btsList: T_BATCH_TERM_SUBJECT[];
  examsLoading?: boolean;
  btsLoading?: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (id: string, payload: Record<string, unknown>) => void;
}) {
  const form = useForm<ExamSubjectValues>({
    resolver: zodResolver(examSubjectSchema),
    defaultValues: {
      examId: record.examId ?? "",
      batchTermSubjectId: record.batchTermSubjectId ?? "",
      fullMarks: record.fullMarks != null ? String(record.fullMarks) : "100",
      passMarks: record.passMarks != null ? String(record.passMarks) : "40",
      examDateBs: record.examDateBs ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) =>
          onSubmit(record.id, {
            examId: v.examId,
            batchTermSubjectId: v.batchTermSubjectId,
            fullMarks: String(v.fullMarks),
            passMarks: String(v.passMarks),
            examDateBs: v.examDateBs || undefined,
          }),
        )}
        className="space-y-4 max-w-xl"
      >
        <div className="flex flex-col gap-3">
          <FormField control={form.control} name="examId" render={({ field }) => (
            <FormItem><FormLabel>Exam</FormLabel><FormControl>
              <SelectCommand value={field.value} onChange={field.onChange} options={exams.map((e) => ({ label: String(e.examName ?? e.name ?? e.id), value: e.id, searchValues: String(e.examName ?? e.name ?? "") }))} placeholder={examsLoading ? "Loading exams..." : "Select exam..."} searchPlaceholder="Search exams..." loading={examsLoading} />
            </FormControl><FormDescription>Select exam (ID reference, unlimited options).</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="batchTermSubjectId" render={({ field }) => (
            <FormItem><FormLabel>Batch Term Subject</FormLabel><FormControl>
              <SelectCommand value={field.value} onChange={field.onChange} options={btsList.map((b) => ({ label: [b.subject?.code, b.subject?.name].filter(Boolean).join(" - ") || b.id, value: b.id, searchValues: `${b.subject?.code ?? ""} ${b.subject?.name ?? ""}` }))} placeholder={btsLoading ? "Loading subjects..." : "Select subject..."} searchPlaceholder="Search subjects..." loading={btsLoading} />
            </FormControl><FormDescription>Select batch term subject (ID reference, unlimited options).</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="fullMarks" render={({ field }) => (
            <FormItem><FormLabel>Full Marks</FormLabel><FormControl><Input placeholder="Full marks..." {...field} /></FormControl><FormDescription>Total possible marks for this exam subject.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="passMarks" render={({ field }) => (
            <FormItem><FormLabel>Pass Marks</FormLabel><FormControl><Input placeholder="Pass marks..." {...field} /></FormControl><FormDescription>Minimum passing marks.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="examDateBs" render={({ field }) => (
            <FormItem><FormLabel isOptional>Exam Date (BS)</FormLabel><FormControl>
              <BsDatePicker value={field.value ?? ""} onChange={(v) => field.onChange(typeof v === "string" ? v : "")} valueFormat="bs" lang="en" clearable />
            </FormControl><FormDescription>Optional exam date in Bikram Sambat.</FormDescription><FormMessage /></FormItem>
          )} />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={isPending}>Update</Button>
        </div>
      </form>
    </Form>
  );
}
