import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import type { AddStudentStepProps } from "../schema";

/** Step 2 — Academic Info. */
export default function StepAcademic({
  form,
  batchOptions,
  batchLoading,
}: AddStudentStepProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="universityRegNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>University Reg. No.</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>Official university registration number.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

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
                placeholder={batchLoading ? "Loading batches..." : "Select batch"}
                searchPlaceholder="Search batches..."
                loading={batchLoading}
              />
            </FormControl>
            <FormDescription>Select batch (ID reference, unlimited options).</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="admissionDateBs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Admission Date (BS)</FormLabel>
            <FormControl>
              <BsDatePicker
                value={field.value}
                onChange={(value) =>
                  field.onChange(typeof value === "string" ? value : "")
                }
                valueFormat="bs"
                lang="en"
                placeholder="Select admission date"
              />
            </FormControl>
            <FormDescription>Admission date in Bikram Sambat.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
