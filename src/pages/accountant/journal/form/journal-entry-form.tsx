import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { mapFieldsOnError } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/query-keys";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { listAccounts, listFiscalYears } from "@/pages/accountant/service-utils";
import { postJournalEntry } from "../service/service";
import {
  defaultJournalLine,
  journalEntryCreateSchema,
  journalEntryDefaultValues,
  type JournalEntryCreateFormValues,
} from "../schema/schema";

interface JournalEntryFormProps {
  onClose: () => void;
}

export default function JournalEntryForm({ onClose }: JournalEntryFormProps) {
  const qc = useQueryClient();
  const form = useForm<JournalEntryCreateFormValues>({
    resolver: zodResolver(journalEntryCreateSchema),
    defaultValues: journalEntryDefaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "lines" });
  const lines = form.watch("lines") ?? [];

  const fiscalYearsQuery = useQuery({
    queryKey: ["accountant-fiscal-years", "unlimited"],
    queryFn: () => listFiscalYears({ page: 1, limit: 999 }),
  });
  const accountsQuery = useQuery({
    queryKey: ["accountant-accounts", "unlimited"],
    queryFn: () => listAccounts({ page: 1, limit: 999 }),
  });

  const fiscalYearOptions = (fiscalYearsQuery.data?.data?.data ?? []).map((fy) => ({
    label: `${fy.name}${fy.isCurrent ? " (Current)" : ""}${fy.isClosed ? " (Closed)" : ""}`,
    value: fy.id,
    searchValues: `${fy.name} ${fy.startDateBs} ${fy.endDateBs}`,
  }));

  const accountOptions = (accountsQuery.data?.data?.data ?? [])
    .filter((a) => a.isActive !== false && a.isGroup !== true)
    .map((a) => ({
      label: [a.code, a.name].filter(Boolean).join(" - ") || a.id,
      value: a.id,
      searchValues: `${a.code ?? ""} ${a.name ?? ""} ${a.type ?? ""}`,
    }));

  const debitTotal = lines.filter((l) => l.direction === "DEBIT").reduce((s, l) => s + Number(l.amount || 0), 0);
  const creditTotal = lines.filter((l) => l.direction === "CREDIT").reduce((s, l) => s + Number(l.amount || 0), 0);
  const balanced = Math.abs(debitTotal - creditTotal) < 0.0001 && debitTotal > 0;

  const mutation = useMutation({
    mutationFn: (data: JournalEntryCreateFormValues) => postJournalEntry(data),
    onSuccess: () => {
      toast.success("Journal entry posted successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_JOURNAL] });
      onClose();
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to post journal entry.");
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && !mutation.isPending && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Post Journal Entry</DialogTitle>
          <DialogDescription>
            Create a balanced manual journal entry (BS date). Debits must equal credits; accounts must be active non-group accounts.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField control={form.control} name="fiscalYearId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fiscal Year</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={field.onChange}
                      options={fiscalYearOptions}
                      placeholder={fiscalYearsQuery.isLoading ? "Loading fiscal years..." : "Select fiscal year..."}
                      searchPlaceholder="Search fiscal years..."
                      loading={fiscalYearsQuery.isLoading}
                    />
                  </FormControl>
                  <FormDescription>Select the fiscal year (ID reference, unlimited options).</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dateBs" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date (BS)</FormLabel>
                  <FormControl>
                    <BsDatePicker
                      value={field.value ?? ""}
                      valueFormat="bs"
                      lang="en"
                      placeholder="Select BS date"
                      onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormDescription>Journal entry date in Bikram Sambat.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input placeholder="e.g. Opening balance adjustment" {...field} /></FormControl>
                <FormDescription>Clear description for audit/reference.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <div className="rounded-md border p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium">Lines</div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span>Debit: <strong>{debitTotal.toFixed(2)}</strong></span>
                  <span>Credit: <strong>{creditTotal.toFixed(2)}</strong></span>
                  <span className={balanced ? "text-emerald-600" : "text-destructive"}>
                    Balance: <strong>{(debitTotal - creditTotal).toFixed(2)}</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {fields.map((f, index) => (
                  <div key={f.id} className="grid grid-cols-1 gap-3 rounded border p-3 md:grid-cols-12">
                    <div className="md:col-span-4">
                      <FormField control={form.control} name={`lines.${index}.accountId`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account</FormLabel>
                          <FormControl>
                            <SelectCommand
                              value={field.value}
                              onChange={field.onChange}
                              options={accountOptions}
                              placeholder={accountsQuery.isLoading ? "Loading accounts..." : "Select account..."}
                              searchPlaceholder="Search accounts..."
                              loading={accountsQuery.isLoading}
                            />
                          </FormControl>
                          <FormDescription>Chart account (active, non-group; unlimited options).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-2">
                      <FormField control={form.control} name={`lines.${index}.direction`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Direction</FormLabel>
                          <FormControl>
                            <SelectCommand
                              value={field.value}
                              onChange={field.onChange}
                              options={[{ label: "Debit", value: "DEBIT" }, { label: "Credit", value: "CREDIT" }]}
                              placeholder="Select"
                              hideSearch
                            />
                          </FormControl>
                          <FormDescription>Debit or credit.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-2">
                      <FormField control={form.control} name={`lines.${index}.amount`} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} step="0.01" value={field.value ?? 0} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                          </FormControl>
                          <FormDescription>Line amount.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="md:col-span-3">
                      <FormField control={form.control} name={`lines.${index}.description`} render={({ field }) => (
                        <FormItem>
                          <FormLabel isOptional>Line Note</FormLabel>
                          <FormControl><Input placeholder="Optional" {...field} value={field.value ?? ""} /></FormControl>
                          <FormDescription>Optional line description.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="flex items-end md:col-span-1">
                      <Button type="button" variant="outline" size="sm" onClick={() => remove(index)} disabled={fields.length <= 2 || mutation.isPending}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => append(defaultJournalLine())} disabled={mutation.isPending}>
                  Add Line
                </Button>
                {form.formState.errors.lines?.message ? (
                  <p className="text-sm text-destructive">{String(form.formState.errors.lines.message)}</p>
                ) : null}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
              <Button type="submit" loading={mutation.isPending} disabled={!balanced || mutation.isPending}>Post Entry</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
