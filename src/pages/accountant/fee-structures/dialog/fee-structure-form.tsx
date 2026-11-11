import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { InputWithSwitch } from "@/components/input-with-switch";
import SelectCommand from "@/components/select-command";
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
  createFeeStructure,
  listBatchOptions,
  listCourseOptions,
  listFeeHeadOptions,
  updateFeeStructure,
  type T_FEE_STRUCTURE,
  type T_FEE_STRUCTURE_INPUT,
} from "../service/service";
import {
  feeStructureCreateDefaultValues,
  feeStructureCreateSchema,
  type FeeStructureCreateValues,
} from "../schema/schema";

/** Create / edit a fee structure (a course, an optional batch override, items). */
export default function FeeStructureFormDialog({
  open,
  onOpenChange,
  structure,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  structure?: T_FEE_STRUCTURE | null;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(structure);

  const form = useForm<FeeStructureCreateValues>({
    resolver: zodResolver(feeStructureCreateSchema),
    defaultValues: feeStructureCreateDefaultValues,
  });
  const courseId = useWatch({ control: form.control, name: "courseId" });

  const coursesQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEE_STRUCTURE_COURSES],
    queryFn: () => listCourseOptions(),
    enabled: open,
  });
  const batchesQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEE_STRUCTURE_BATCHES, courseId],
    queryFn: () => listBatchOptions(),
    enabled: open && Boolean(courseId),
  });
  const headsQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEE_STRUCTURE_HEADS],
    queryFn: () => listFeeHeadOptions(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      structure
        ? {
            courseId: structure.courseId ?? "",
            batchId: structure.batchId ?? "",
            name: structure.name ?? "",
            isActive: structure.isActive ?? true,
            items: (structure.items ?? []).map((item) => ({
              feeHeadId: item.feeHeadId,
              termNumber: item.termNumber ?? null,
              amount: Number(item.amount ?? 0),
            })),
          }
        : feeStructureCreateDefaultValues,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, structure]);

  const courseOptions = (
    coursesQuery.data?.data?.data ?? []
  ).map((course) => ({
    label: `${course.name}${course.code ? ` (${course.code})` : ""}`,
    value: course.id,
  }));

  const batchOptions = (batchesQuery.data?.data?.data ?? [])
    .filter((batch) => !courseId || batch.courseId === courseId)
    .map((batch) => ({ label: batch.name, value: batch.id }));

  const headOptions = (headsQuery.data?.data?.data ?? []).map((head) => ({
    label: `${head.name}${head.code ? ` (${head.code})` : ""}`,
    value: head.id,
  }));

  const mutation = useMutation({
    mutationFn: (values: FeeStructureCreateValues) => {
      const input: T_FEE_STRUCTURE_INPUT = {
        courseId: values.courseId,
        batchId: values.batchId || null,
        name: values.name.trim(),
        isActive: values.isActive,
        items: values.items.map((item) => ({
          feeHeadId: item.feeHeadId,
          termNumber: item.termNumber ?? null,
          amount: item.amount,
        })),
      };
      return structure
        ? updateFeeStructure(structure.id, input)
        : createFeeStructure(input);
    },
    onSuccess: () => {
      toast.success(
        isEdit ? "Fee structure updated." : "Fee structure created.",
      );
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_FEES_STRUCTURE] });
      onOpenChange(false);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to save the fee structure.",
      );
    },
  });

  const items = useWatch({ control: form.control, name: "items" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Fee Structure" : "New Fee Structure"}
          </DialogTitle>
          <DialogDescription>
            A fee structure belongs to a course. Leave the batch empty to make
            it the default for every batch of that course, or pick a batch to
            override the default for that batch only.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          form.setValue("batchId", "");
                        }}
                        options={courseOptions}
                        placeholder="Select course..."
                        searchPlaceholder="Search courses..."
                        loading={coursesQuery.isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Batch override</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={field.onChange}
                        options={batchOptions}
                        placeholder={
                          courseId
                            ? "Default for the whole course"
                            : "Select a course first"
                        }
                        searchPlaceholder="Search batches..."
                        loading={batchesQuery.isLoading}
                        disabled={!courseId}
                        withClear
                      />
                    </FormControl>
                    <FormDescription>
                      Empty = the course default.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. BIT 2081 Semester Fee"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Fee items</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    form.setValue("items", [
                      ...items,
                      { feeHeadId: "", termNumber: null, amount: 0 },
                    ])
                  }
                >
                  Add item
                </Button>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 items-start gap-3 rounded-md border p-3 md:grid-cols-[1fr_120px_140px_auto]"
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.feeHeadId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Fee head</FormLabel>
                        <FormControl>
                          <SelectCommand
                            value={field.value}
                            onChange={field.onChange}
                            options={headOptions}
                            placeholder="Select fee head..."
                            searchPlaceholder="Search fee heads..."
                            loading={headsQuery.isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.termNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Term</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="One time"
                            value={field.value ?? ""}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Empty = one time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.amount`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Amount"
                            value={Number.isFinite(Number(field.value))
                              ? field.value
                              : 0}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() =>
                      form.setValue(
                        "items",
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <FormField
                control={form.control}
                name="items"
                render={() => <FormMessage />}
              />
            </div>

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
                    An inactive structure is not offered when assigning fees.
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
                {isEdit ? "Save Changes" : "Create Fee Structure"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
