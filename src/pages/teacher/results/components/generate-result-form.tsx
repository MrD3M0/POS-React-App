import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/button";
import SelectCommand from "@/components/select-command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { generateResultSchema, type GenerateResultValues } from "../schema";

export type Option = { label: string; value: string };

export default function GenerateResultForm({
  examOptions,
  studentOptions,
  examsLoading,
  studentsLoading,
  isPending,
  onSubmit,
}: {
  examOptions: Option[];
  studentOptions: Option[];
  examsLoading?: boolean;
  studentsLoading?: boolean;
  isPending?: boolean;
  onSubmit: (values: GenerateResultValues) => void;
}) {
  const form = useForm<GenerateResultValues>({
    resolver: zodResolver(generateResultSchema),
    defaultValues: { examId: "", studentId: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
        <FormField control={form.control} name="examId" render={({ field }) => (
          <FormItem className="min-w-[240px]">
            <FormLabel>Exam</FormLabel>
            <FormControl>
              <SelectCommand value={field.value} onChange={field.onChange} options={examOptions} placeholder={examsLoading ? "Loading exams..." : "Select exam..."} searchPlaceholder="Search exams..." loading={examsLoading} />
            </FormControl>
            <FormDescription>Select exam (ID reference, unlimited options).</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="studentId" render={({ field }) => (
          <FormItem className="min-w-[240px]">
            <FormLabel>Student</FormLabel>
            <FormControl>
              <SelectCommand value={field.value} onChange={field.onChange} options={studentOptions} placeholder={studentsLoading ? "Loading students..." : "Select student..."} searchPlaceholder="Search students..." loading={studentsLoading} />
            </FormControl>
            <FormDescription>Select student (ID reference, unlimited options).</FormDescription>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" variant="primary" size="sm" loading={isPending}>Create</Button>
      </form>
    </Form>
  );
}
