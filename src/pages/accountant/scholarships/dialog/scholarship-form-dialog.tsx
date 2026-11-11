import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputWithSwitch } from "@/components/input-with-switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import {
  createScholarship,
  updateScholarship,
  type T_SCHOLARSHIP,
  type T_SCHOLARSHIP_INPUT,
} from "../service/service";
import {
  scholarshipDefaultValues,
  scholarshipSchema,
  type ScholarshipFormValues,
} from "../schema/schema";

/** Create / edit a scholarship scheme (name, percent or fixed amount). */
export default function ScholarshipFormDialog({
  open,
  onOpenChange,
  scholarship,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scholarship?: T_SCHOLARSHIP | null;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(scholarship);

  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: scholarshipDefaultValues,
  });
  const type = useWatch({ control: form.control, name: "type" });

  useEffect(() => {
    if (!open) return;
    form.reset(
      scholarship
        ? {
            name: scholarship.name ?? "",
            code: scholarship.code ?? "",
            type: scholarship.type ?? "PERCENT",
            value: Number(scholarship.value ?? 0),
            description: scholarship.description ?? "",
            isActive: scholarship.isActive ?? true,
          }
        : scholarshipDefaultValues,
    );
  }, [open, scholarship, form]);

  const mutation = useMutation({
    mutationFn: (values: ScholarshipFormValues) => {
      const input: T_SCHOLARSHIP_INPUT = {
        name: values.name.trim(),
        code: values.code?.trim() || null,
        type: values.type,
        value: values.value,
        description: values.description?.trim() || null,
        isActive: values.isActive,
      };
      return scholarship
        ? updateScholarship(scholarship.id, input)
        : createScholarship(input);
    },
    onSuccess: () => {
      toast.success(
        isEdit ? "Scholarship updated." : "Scholarship created.",
      );
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_SCHOLARSHIPS] });
      onOpenChange(false);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to save the scholarship.",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Scholarship" : "New Scholarship"}
          </DialogTitle>
          <DialogDescription>
            A scholarship is a scheme the accountant can grant to a student. A
            percentage scholarship takes a share of every selected fee, a fixed
            scholarship is an amount spread over the selected fees.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Merit Scholarship 2081"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Shown to the student on the fee list.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <select
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        {...field}
                      >
                        <option value="PERCENT">Percentage of fee</option>
                        <option value="FIXED">Fixed amount (NPR)</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      How the value is applied to the fee items.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={
                          type === "PERCENT" ? "50" : "10000"
                        }
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? 0
                              : Number(event.target.value),
                          )
                        }
                        value={Number.isFinite(Number(field.value))
                          ? field.value
                          : 0}
                      />
                    </FormControl>
                    <FormDescription>
                      {type === "PERCENT"
                        ? "Percent of each selected fee (1-100)."
                        : "Amount in NPR, spread over the selected fees."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isOptional>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="MERIT-2081" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional short code, unique in the college.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isOptional>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Who qualifies for this scholarship?"
                      className="min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormDescription>
                    An inactive scholarship cannot be granted.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                {isEdit ? "Save Changes" : "Create Scholarship"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
