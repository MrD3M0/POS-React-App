import type { UseFormReturn } from "react-hook-form";
import Input from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/form";
import {
  EMPLOYEE_FIELD_LABELS,
  EMPLOYEE_STEP_FIELDS,
  EMPLOYEE_STEPS,
  formatEmployeeFieldValue,
  type T_EMPLOYEE_CREATE,
  type T_EMPLOYEE_STEP,
} from "./employee.schema";

type BankReviewStepProps = {
  form: UseFormReturn<T_EMPLOYEE_CREATE>;
  onEditStep: (step: T_EMPLOYEE_STEP) => void;
};

const REVIEW_FIELDS_BY_STEP: Record<T_EMPLOYEE_STEP, readonly (keyof T_EMPLOYEE_CREATE)[]> =
  EMPLOYEE_STEP_FIELDS;

export default function BankReviewStep({ form, onEditStep }: BankReviewStepProps) {
  const values = form.getValues();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="panNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel isOptional>PAN No.</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Optional PAN number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ssfNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel isOptional>SSF No.</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Optional SSF number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel isOptional>Bank Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Optional bank name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankAccountNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel isOptional>Bank Account No.</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Optional bank account number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Read-only review of everything entered across steps 1-3 */}
      <div className="rounded-lg border">
        <div className="border-b px-4 py-2.5">
          <h3 className="text-sm font-medium">Review</h3>
          <p className="text-xs text-muted-foreground">
            Check the entered details before creating the employee.
          </p>
        </div>
        <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {EMPLOYEE_STEPS.map((step, index) => {
            const stepIndex = index as T_EMPLOYEE_STEP;
            return (
              <div key={step.label} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {step.label}
                  </p>
                  <button
                    type="button"
                    onClick={() => onEditStep(stepIndex)}
                    className="text-xs font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Edit
                  </button>
                </div>
                <dl className="space-y-1">
                  {REVIEW_FIELDS_BY_STEP[stepIndex].map((field) => (
                    <div
                      key={field}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <dt className="shrink-0 text-muted-foreground">
                        {EMPLOYEE_FIELD_LABELS[field]}
                      </dt>
                      <dd className="text-right break-words">
                        {formatEmployeeFieldValue(field, values[field])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
