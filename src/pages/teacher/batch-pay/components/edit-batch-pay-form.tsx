import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { BsDatePicker } from "@/components/bs-datepicker";
import SelectCommand from "@/components/select-command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import type { T_MY_CLASS } from "../../my-classes/service/service";
import type { T_TEACHER_BATCH_PAY } from "../service/service";
import { batchPaySchema, type BatchPayValues } from "../schema";

function classLabel(c: T_MY_CLASS): string {
  const subject = c.subject?.code ?? c.subject?.name ?? c.subjectCode ?? c.subjectName ?? "";
  return [c.batchName ?? c.batch?.name, subject, c.className].filter(Boolean).join(" / ") || c.id;
}

export default function EditBatchPayForm({
  record,
  classes,
  classesLoading,
  isPending,
  onCancel,
  onSubmit,
}: {
  record: T_TEACHER_BATCH_PAY;
  classes: T_MY_CLASS[];
  classesLoading?: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (id: string, payload: Record<string, unknown>) => void;
}) {
  const form = useForm<BatchPayValues>({
    resolver: zodResolver(batchPaySchema),
    defaultValues: {
      teachingAssignmentId: record.teachingAssignmentId ?? "",
      ratePerCreditHour: record.ratePerCreditHour != null ? String(record.ratePerCreditHour) : "",
      fixedMonthlyAmount: record.fixedMonthlyAmount != null ? String(record.fixedMonthlyAmount) : "",
      effectiveFromBs: record.effectiveFromBs ?? "",
      effectiveToBs: record.effectiveToBs ?? "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) =>
          onSubmit(record.id, {
            teachingAssignmentId: v.teachingAssignmentId,
            ratePerCreditHour: v.ratePerCreditHour ? Number(v.ratePerCreditHour) : null,
            fixedMonthlyAmount: v.fixedMonthlyAmount ? Number(v.fixedMonthlyAmount) : null,
            effectiveFromBs: v.effectiveFromBs,
            effectiveToBs: v.effectiveToBs || null,
          }),
        )}
        className="space-y-4 max-w-xl"
      >
        <div className="flex flex-col gap-3">
          <FormField control={form.control} name="teachingAssignmentId" render={({ field }) => (
            <FormItem><FormLabel>Teaching Assignment</FormLabel><FormControl>
              <SelectCommand value={field.value} onChange={field.onChange} options={classes.map((c) => ({ label: classLabel(c), value: c.id, searchValues: classLabel(c) }))} placeholder="Select class..." searchPlaceholder="Search classes..." loading={classesLoading} />
            </FormControl><FormDescription>Select the teaching assignment/class (ID reference).</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="ratePerCreditHour" render={({ field }) => (
            <FormItem><FormLabel isOptional>Rate per credit hour</FormLabel><FormControl><Input placeholder="Rate per credit hour..." {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional rate; provide this or fixed monthly amount.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="fixedMonthlyAmount" render={({ field }) => (
            <FormItem><FormLabel isOptional>Fixed monthly amount</FormLabel><FormControl><Input placeholder="Fixed monthly amount..." {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional fixed amount; provide this or rate per credit hour.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="effectiveFromBs" render={({ field }) => (
            <FormItem><FormLabel>Effective From (BS)</FormLabel><FormControl>
              <BsDatePicker value={field.value} onChange={(v) => field.onChange(typeof v === "string" ? v : "")} valueFormat="bs" lang="en" />
            </FormControl><FormDescription>Effective start date in Bikram Sambat.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="effectiveToBs" render={({ field }) => (
            <FormItem><FormLabel isOptional>Effective To (BS)</FormLabel><FormControl>
              <BsDatePicker value={field.value ?? ""} onChange={(v) => field.onChange(typeof v === "string" ? v : "")} valueFormat="bs" lang="en" clearable />
            </FormControl><FormDescription>Optional effective end date in BS.</FormDescription><FormMessage /></FormItem>
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
