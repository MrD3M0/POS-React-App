import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Plus, Trash2 } from "lucide-react";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { InputWithSwitch } from "@/components/input-with-switch";
import SelectCommand from "@/components/select-command";
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
import {
  createFeeStructure,
  getFeeStructure,
  listBatchOptions,
  listCourseOptions,
  listFeeHeadOptions,
  updateFeeStructure,
  type T_COURSE_OPTION,
  type T_FEE_STRUCTURE_INPUT,
} from "./service/service";
import {
  feeStructureCreateDefaultValues,
  feeStructureCreateSchema,
  type FeeStructureCreateValues,
} from "./schema/schema";

/** Sentinel term value: "every term" — expanded into one row per term. */
const EVERY_TERM = "__all__";

/** Column headers shown above the item rows on sm+ (rows stack on mobile). */
function RowHeaders() {
  return (
    <div className="hidden text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_180px_150px_40px] sm:gap-3">
      <span>Fee Head</span>
      <span>Term</span>
      <span className="text-right">Amount (Rs.)</span>
      <span aria-hidden />
    </div>
  );
}

/**
 * Full-page fee structure form (create + edit). A structure belongs to a
 * course; leaving the batch empty makes it the course default, picking a
 * batch makes it that batch's own fee — every term (Semester/Year) can cost
 * a different amount through its own fee item.
 */
export default function FeeStructureFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = Boolean(id);

  const coursesQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEE_STRUCTURE_COURSES],
    queryFn: () => listCourseOptions(),
  });
  const headsQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEE_STRUCTURE_HEADS],
    queryFn: () => listFeeHeadOptions(),
  });
  const structureQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEES_STRUCTURE, id],
    queryFn: () => getFeeStructure(id as string),
    enabled: isEdit,
  });

  const form = useForm<FeeStructureCreateValues>({
    resolver: zodResolver(feeStructureCreateSchema),
    defaultValues: feeStructureCreateDefaultValues,
  });
  const itemsArray = useFieldArray({ control: form.control, name: "items" });
  const courseId = useWatch({ control: form.control, name: "courseId" });
  const batchId = useWatch({ control: form.control, name: "batchId" });
  const items = useWatch({ control: form.control, name: "items" });

  // In edit mode, fill the form once the structure arrives.
  useEffect(() => {
    const structure = structureQuery.data?.data;
    if (!isEdit || !structure) return;
    form.reset({
      courseId: structure.courseId ?? "",
      batchId: structure.batchId ?? "",
      name: structure.name ?? "",
      isActive: structure.isActive ?? true,
      items: (structure.items ?? []).map((item) => ({
        feeHeadId: item.feeHeadId,
        termNumber: item.termNumber ?? null,
        amount: Number(item.amount ?? 0),
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, structureQuery.data]);

  const batchesQuery = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT_FEE_STRUCTURE_BATCHES, courseId],
    queryFn: () => listBatchOptions(),
    enabled: Boolean(courseId),
  });

  const courses = coursesQuery.data?.data?.data ?? [];
  const selectedCourse: T_COURSE_OPTION | undefined =
    courses.find((c) => c.id === courseId) ?? structureQuery.data?.data?.course ?? undefined;
  const termUnit = selectedCourse?.system === "YEARLY" ? "Year" : "Semester";
  const totalTerms = Number(selectedCourse?.totalTerms ?? 0);

  // One select option per term of the course, plus a one-time (admission) row.
  const termOptions = useMemo(
    () => [
      { label: "One time (e.g. admission)", value: "", searchValues: "one time admission" },
      ...Array.from({ length: Math.max(0, totalTerms) }, (_, i) => ({
        label: `${termUnit} ${i + 1}`,
        value: String(i + 1),
        searchValues: `${termUnit} ${i + 1}`,
      })),
    ],
    [termUnit, totalTerms],
  );

  const courseOptions = courses.map((course) => ({
    label: `${course.name}${course.code ? ` (${course.code})` : ""}`,
    value: course.id,
    searchValues: `${course.name} ${course.code ?? ""}`,
  }));

  const batchOptions = (batchesQuery.data?.data?.data ?? [])
    .filter((batch) => !courseId || batch.courseId === courseId)
    .map((batch) => ({ label: batch.name, value: batch.id, searchValues: batch.name }));

  // Auto-generate the name as "Course — Batch" (batch omitted when the
  // structure is the course default). A name the user typed is never
  // overwritten — only names this effect generated before get replaced.
  const autoNameRef = useRef("");
  useEffect(() => {
    const course = (coursesQuery.data?.data?.data ?? []).find((c) => c.id === courseId);
    const batch = (batchesQuery.data?.data?.data ?? []).find((b) => b.id === batchId);
    const auto = [course?.name, batch?.name].filter(Boolean).join(" — ");
    if (!auto) return;
    const currentName = form.getValues("name");
    if (!currentName || currentName === autoNameRef.current) {
      autoNameRef.current = auto;
      form.setValue("name", auto, { shouldValidate: false });
    }
  }, [courseId, batchId, coursesQuery.data, batchesQuery.data, form]);

  const headOptions = (headsQuery.data?.data?.data ?? []).map((head) => ({
    label: `${head.name}${head.code ? ` (${head.code})` : ""}`,
    value: head.id,
    searchValues: `${head.name} ${head.code ?? ""}`,
  }));

  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

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
      return isEdit ? updateFeeStructure(id as string, input) : createFeeStructure(input);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Fee structure updated." : "Fee structure created.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_FEES_STRUCTURE] });
      navigate("/accountant/fee-structures");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to save the fee structure.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title={isEdit ? "Edit Fee Structure" : "Create Fee Structure"}
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant/fee-structures" },
          { title: "Fee Structures", link: "/accountant/fee-structures" },
          { title: isEdit ? "Edit" : "Create", link: isEdit ? `/accountant/fee-structures/${id}/edit` : "/accountant/fee-structures/create" },
        ]}
        backPage="/accountant/fee-structures"
      />

      <div className="mt-4 w-full">
        {isEdit && structureQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading fee structure...</p>
        ) : isEdit && structureQuery.isError ? (
          <p className="text-sm text-destructive">Failed to load the fee structure.</p>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
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
                            form.setValue("batchId", "", { shouldValidate: false });
                          }}
                          options={courseOptions}
                          placeholder={coursesQuery.isLoading ? "Loading courses..." : "Select course"}
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
                      <FormLabel isOptional>Batch</FormLabel>
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
                        Empty = course default. Pick a batch to give it its own fee.
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
                      <Input placeholder="Auto: course + batch name" {...field} />
                    </FormControl>
                    <FormDescription>Filled from the course and batch — you can still type your own.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fee items — one row per fee head and term */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Fee Items</p>
                    <p className="text-xs text-muted-foreground">
                      Each Semester/Year can cost a different amount — add one row per fee head and term, or pick "Every term" to repeat a fee across all terms.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => itemsArray.append({ feeHeadId: "", termNumber: null, amount: NaN })}
                  >
                    <Plus className="h-4 w-4" /> Add item
                  </Button>
                </div>

                <RowHeaders />

                <div className="space-y-2">
                  {itemsArray.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 items-center gap-2 rounded-md border border-border p-3 sm:grid-cols-[1fr_180px_150px_40px] sm:gap-3"
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
                                placeholder="Select fee head"
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
                        render={({ field }) => {
                          // "Every term" repeats the same fee head + amount
                          // across ALL terms of the course, so it is only
                          // offered once a fee head is picked.
                          const rowHead = items[index]?.feeHeadId ?? "";
                          const everyTermDisabled = !rowHead || totalTerms < 1;
                          const rowTermOptions = [
                            ...termOptions,
                            {
                              label: `Every ${termUnit.toLowerCase()} (repeats)`,
                              value: EVERY_TERM,
                              searchValues: `every ${termUnit.toLowerCase()} all repeat`,
                              disabled: everyTermDisabled,
                              disabledTooltipContent: everyTermDisabled
                                ? totalTerms < 1
                                  ? "This course has no terms configured"
                                  : "Select a fee head first"
                                : undefined,
                            },
                          ];
                          return (
                            <FormItem>
                              <FormLabel className="sr-only">Term</FormLabel>
                              <FormControl>
                                <SelectCommand
                                  value={field.value == null ? "" : String(field.value)}
                                  onChange={(value) => {
                                    if (value === EVERY_TERM) {
                                      // Replace this row with one row per term,
                                      // all sharing the same fee head + amount.
                                      const current = form.getValues("items")[index];
                                      const rows = Array.from({ length: totalTerms }, (_, i) => ({
                                        feeHeadId: current?.feeHeadId ?? "",
                                        termNumber: i + 1,
                                        amount: Number(current?.amount ?? 0),
                                      }));
                                      itemsArray.remove(index);
                                      itemsArray.insert(index, rows);
                                      return;
                                    }
                                    field.onChange(value === "" ? null : Number(value));
                                  }}
                                  options={rowTermOptions}
                                  placeholder={courseId ? "Select term" : "Select a course first"}
                                  searchPlaceholder="Search terms..."
                                  disabled={!courseId || totalTerms < 1}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
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
                                inputMode="decimal"
                                min="0"
                                step="0.01"
                                className="text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                placeholder="0.00"
                                value={Number.isFinite(field.value) ? field.value : ""}
                                onChange={(event) => field.onChange(event.target.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove item"
                        className="h-10 w-10 shrink-0 justify-self-end text-muted-foreground hover:text-destructive sm:justify-self-start"
                        disabled={itemsArray.fields.length === 1}
                        onClick={() => itemsArray.remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormField control={form.control} name="items" render={() => <FormMessage />} />
                <p className="text-xs text-muted-foreground">
                  Total structure amount: <span className="font-medium tabular-nums">Rs. {totalAmount.toFixed(2)}</span>
                </p>
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

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <Link to="/accountant/fee-structures">
                  <Button type="button" variant="secondary" disabled={mutation.isPending}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" variant="primary" loading={mutation.isPending} disabled={mutation.isPending}>
                  {isEdit ? "Save Changes" : "Create Fee Structure"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
