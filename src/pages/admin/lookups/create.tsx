import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { InputWithSwitch } from "@/components/input-with-switch";
import PageHeader from "@/components/common/page-header";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { createLookup } from "./service/service";
import {
  LOOKUP_TYPES,
  buildLookupPayload,
  lookupCreateDefaultValues,
  lookupCreateSchema,
  type LookupCreateFormValues,
  type LookupType,
} from "./schema/schema";

function isLookupType(v: string | null): v is LookupType {
  return !!v && LOOKUP_TYPES.some((t) => t.value === v);
}

export default function CreateLookupPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const initialType: LookupType = isLookupType(params.get("type")) ? (params.get("type") as LookupType) : "leaveType";

  const form = useForm<LookupCreateFormValues>({
    resolver: zodResolver(lookupCreateSchema),
    defaultValues: lookupCreateDefaultValues(initialType),
  });

  const type = form.watch("type");

  useEffect(() => {
    // When type changes (e.g., via query/default), reset type-specific defaults but keep type.
    form.reset(lookupCreateDefaultValues(type));
  }, [type, form]);

  const mutation = useMutation({
    mutationFn: (data: LookupCreateFormValues) => createLookup(data.type, buildLookupPayload(data)),
    onSuccess: (_res, data) => {
      toast.success("Lookup created successfully.");
      qc.invalidateQueries({ queryKey: ["admin-lookup", data.type] });
      navigate("/admin/lookups");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create lookup.");
    },
  });

  const currentLabel = LOOKUP_TYPES.find((l) => l.value === type)?.label ?? "Lookup";

  return (
    <div className="p-5">
      <PageHeader
        title={`Create ${currentLabel}`}
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Lookups", link: "/admin/lookups" },
          { title: "Create", link: "/admin/lookups/create" },
        ]}
        backPage="/admin/lookups"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lookup Type</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={(v) => field.onChange(v as LookupType)}
                      options={LOOKUP_TYPES.map((t) => ({ label: t.label, value: t.value }))}
                      placeholder="Select lookup type"
                      hideSearch
                    />
                  </FormControl>
                  <FormDescription>Choose which master data category to create.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(type === "leaveType" || type === "examType" || type === "feeHead" || type === "paymentMethod" || type === "salaryComponent" || type === "chartAccount") && (
                <>
                  <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl><Input placeholder="e.g. SL, TUT, ASSET" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Unique code for this lookup.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="Display name" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Human-readable name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {type === "leaveType" && (
                <>
                  <FormField control={form.control} name="yearlyAllowed" render={({ field }) => (
                    <FormItem>
                      <FormLabel isOptional>Yearly Allowed (days)</FormLabel>
                      <FormControl><Input type="number" min={0} {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Optional annual entitlement.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isPaid" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paid Leave</FormLabel>
                      <FormControl><InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Paid", off: "Unpaid" }} /></FormControl>
                      <FormDescription>Whether this leave type is paid.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {type === "period" && (
                <>
                  <FormField control={form.control} name="periodNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period #</FormLabel>
                      <FormControl><Input type="number" min={1} {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Sequence number of the period.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="e.g. First Period" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Display name for the period.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="startTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl><Input type="time" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Period start time (HH:mm).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="endTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl><Input type="time" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Period end time (HH:mm).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl><InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Active", off: "Inactive" }} /></FormControl>
                      <FormDescription>Inactive periods are not used in scheduling.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {type === "gradeScale" && (
                <>
                  <FormField control={form.control} name="grade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <FormControl><Input placeholder="e.g. A+" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Grade symbol.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="minPercent" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min %</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Minimum percentage for this grade.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="maxPercent" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max %</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Maximum percentage for this grade.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gradePoint" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Point</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Numeric grade point value.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel isOptional>Description</FormLabel>
                      <FormControl><Input placeholder="Optional description" {...field} value={field.value ?? ""} /></FormControl>
                      <FormDescription>Optional notes for this grade band.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isPassGrade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pass Grade</FormLabel>
                      <FormControl><InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Pass", off: "Fail" }} /></FormControl>
                      <FormDescription>Whether this grade counts as pass.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {(type === "feeHead" || type === "paymentMethod") && (
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl><InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Active", off: "Inactive" }} /></FormControl>
                    <FormDescription>Inactive items are hidden from normal selection.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              {type === "salaryComponent" && (
                <>
                  <FormField control={form.control} name="componentType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <SelectCommand
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          options={[
                            { label: "Earning", value: "EARNING" },
                            { label: "Deduction", value: "DEDUCTION" },
                            { label: "Employer Contribution", value: "EMPLOYER_CONTRIBUTION" },
                          ]}
                          placeholder="Select type"
                          hideSearch
                        />
                      </FormControl>
                      <FormDescription>Salary component category.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isDeduction" render={({ field }) => (
                    <FormItem><FormLabel>Deduction</FormLabel><FormControl><InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Yes", off: "No" }} /></FormControl><FormDescription>Deducted from gross pay.</FormDescription><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="isEmployerContribution" render={({ field }) => (
                    <FormItem><FormLabel>Employer Contribution</FormLabel><FormControl><InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Yes", off: "No" }} /></FormControl><FormDescription>Paid by employer (not deducted from employee).</FormDescription><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="isTaxable" render={({ field }) => (
                    <FormItem><FormLabel>Taxable</FormLabel><FormControl><InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Yes", off: "No" }} /></FormControl><FormDescription>Included in taxable income calculation.</FormDescription><FormMessage /></FormItem>
                  )} />
                </>
              )}

              {type === "chartAccount" && (
                <>
                  <FormField control={form.control} name="accountType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <SelectCommand
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          options={[
                            { label: "Asset", value: "ASSET" },
                            { label: "Liability", value: "LIABILITY" },
                            { label: "Equity", value: "EQUITY" },
                            { label: "Income", value: "INCOME" },
                            { label: "Expense", value: "EXPENSE" },
                          ]}
                          placeholder="Select account type"
                          hideSearch
                        />
                      </FormControl>
                      <FormDescription>Chart of accounts category.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isGroup" render={({ field }) => (
                    <FormItem><FormLabel>Is Group</FormLabel><FormControl><InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Yes", off: "No" }} /></FormControl><FormDescription>Group accounts contain child accounts.</FormDescription><FormMessage /></FormItem>
                  )} />
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/lookups">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Create {currentLabel.replace(/s$/, "")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
