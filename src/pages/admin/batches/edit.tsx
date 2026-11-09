import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import SelectCommand from "@/components/select-command";
import { InputWithSwitch } from "@/components/input-with-switch";
import PageHeader from "@/components/common/page-header";
import { BsDatePicker } from "@/components/bs-datepicker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { getBatchById, updateBatch } from "./service/service";
import { batchDefaultValues, batchSchema, type BatchFormValues } from "./schema/schema";
import { listCourses } from "@/pages/admin/courses/service/service";

export default function EditBatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.BATCH, id],
    queryFn: () => getBatchById(id!),
    enabled: !!id,
  });

  const coursesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_COURSE_LIST, "select", "unlimited"],
    queryFn: () => listCourses({ page: 1, limit: 999 }),
  });

  const courses = coursesQuery.data?.data?.data ?? [];
  const courseOptions = courses.map((c) => ({
    label: `${c.code} — ${c.name}`,
    value: c.id,
    searchValues: `${c.code} ${c.name}`,
  }));

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: batchDefaultValues,
  });

  useEffect(() => {
    const b = query.data?.data;
    if (b) {
      form.reset({
        courseId: b.courseId,
        name: b.name,
        startDateBs: b.startDateBs ?? "",
        currentTermNumber: b.currentTermNumber,
        isActive: b.isActive ?? true,
      });
    }
  }, [query.data, form]);

  const mutation = useMutation({
    mutationFn: (data: BatchFormValues) =>
      updateBatch(id!, {
        courseId: data.courseId,
        name: data.name.trim(),
        startDateBs: data.startDateBs?.trim() || undefined,
        currentTermNumber: data.currentTermNumber,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      toast.success("Batch updated successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH, id] });
      navigate("/admin/batches");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to update batch.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !id) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Edit Batch"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Batches", link: "/admin/batches" },
          { title: "Edit", link: `/admin/batches/edit/${id}` },
        ]}
        backPage="/admin/batches"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={field.onChange}
                      options={courseOptions}
                      placeholder={coursesQuery.isLoading ? "Loading courses..." : "Select a course"}
                      searchPlaceholder="Search courses by code or name..."
                      loading={coursesQuery.isLoading}
                    />
                  </FormControl>
                  <FormDescription>Choose the course this batch belongs to.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2081" {...field} />
                    </FormControl>
                    <FormDescription>Admission year or batch label.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentTermNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Term</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>Current semester/year number for this batch.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="startDateBs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isOptional>Start Date (BS)</FormLabel>
                  <FormControl>
                    <BsDatePicker
                      value={field.value ?? ""}
                      valueFormat="bs"
                      lang="en"
                      placeholder="Select start date (BS)"
                      onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormDescription>Optional academic start date in Bikram Sambat.</FormDescription>
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
                  <FormDescription>Inactive batches are hidden from normal selection flows.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/batches">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
