import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { InputWithSwitch } from "@/components/input-with-switch";
import { BsDateTimePicker } from "@/components/bs-datetimepicker";
import SelectCommand from "@/components/select-command";
import type { T_MY_CLASS } from "../../my-classes/service/service";
import type { T_ATTENDANCE_SESSION, T_PERIOD } from "../service/service";
import { attendanceSessionSchema, type AttendanceSessionValues } from "../schema";

function classLabel(c: T_MY_CLASS): string {
  const subject = c.subject?.code ?? c.subject?.name ?? c.subjectCode ?? c.subjectName ?? "";
  return [c.batchName ?? c.batch?.name, subject, c.className].filter(Boolean).join(" / ") || c.id;
}

export default function EditAttendanceSessionForm({
  record,
  classes,
  periods,
  classesLoading,
  periodsLoading,
  isPending,
  onCancel,
  onSubmit,
}: {
  record: T_ATTENDANCE_SESSION;
  classes: T_MY_CLASS[];
  periods: T_PERIOD[];
  classesLoading?: boolean;
  periodsLoading?: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (id: string, values: AttendanceSessionValues) => void;
}) {
  const form = useForm<AttendanceSessionValues>({
    resolver: zodResolver(attendanceSessionSchema),
    defaultValues: {
      teachingAssignmentId: record.teachingAssignmentId ?? "",
      periodId: record.periodId ?? "",
      dateBs: record.dateBs ?? "",
      isLocked: Boolean(record.isLocked ?? record.locked ?? false),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => onSubmit(record.id, values))}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <FormField control={form.control} name="teachingAssignmentId" render={({ field }) => (
            <FormItem><FormLabel>Teaching Assignment</FormLabel><FormControl>
              <SelectCommand value={field.value} onChange={field.onChange} options={classes.map((c) => ({ label: classLabel(c), value: c.id, searchValues: classLabel(c) }))} placeholder="Select class..." searchPlaceholder="Search classes..." loading={classesLoading} />
            </FormControl><FormDescription>Select the teaching assignment/class (ID reference).</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="periodId" render={({ field }) => (
            <FormItem><FormLabel>Period</FormLabel><FormControl>
              <SelectCommand value={field.value} onChange={field.onChange} options={periods.map((p) => ({ label: p.name ?? (p.periodNumber != null ? `Period ${p.periodNumber}` : p.id), value: p.id, searchValues: `${p.name ?? ""} ${p.periodNumber ?? ""}` }))} placeholder="Select period..." searchPlaceholder="Search periods..." loading={periodsLoading} />
            </FormControl><FormDescription>Select the period (ID reference).</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="dateBs" render={({ field }) => (
            <FormItem><FormLabel>Date &amp; Time (BS)</FormLabel><FormControl>
              <BsDateTimePicker value={field.value} onChange={(v) => field.onChange(typeof v === "string" ? v : "")} valueFormat="bs" lang="en" className="w-full" />
            </FormControl><FormDescription>Session date and time in Bikram Sambat.</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="isLocked" render={({ field }) => (
            <FormItem><FormLabel>Locked</FormLabel><FormControl>
              <InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Locked", off: "Open" }} />
            </FormControl><FormDescription>Lock the session to prevent attendance edits.</FormDescription><FormMessage /></FormItem>
          )} />
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" loading={isPending}>Update</Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
