import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { mapFieldsOnError } from "@/lib/utils";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { T_UseQueryError } from "@/types/common";
import { BatchSchema, bsToDate, type T_BatchSchema } from "./schema/schema";
import { getBatchById, updateBatch } from "./service/service";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button  from "@/components/ui/button";
import Input from "@/components/ui/input";
import { InputWithSwitch } from "@/components/input-with-switch";
import SelectCommand from "@/components/select-command";
import { listCourses } from "@/pages/admin/courses/service/service";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { BsDatePicker } from "@/components/bs-datepicker";

export default function EditBatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const coursesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_COURSE_LIST, "batch-edit", "unlimited"],
    queryFn: () => listCourses({ page: 1, limit: 999 }),
  });
  const courses = (coursesQuery.data?.data?.data ?? coursesQuery.data?.data ?? []) as Array<{
    id: string;
    code?: string;
    name?: string;
  }>;

  const form = useForm({
    resolver: zodResolver(BatchSchema),
    defaultValues: {
      courseId: "",
      name: "",
      currentTermNumber: 1,
      isActive: true,
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.BATCH, id],
    queryFn: () => getBatchById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.data) {
      const batch = data.data;
      form.reset({
        courseId: batch.courseId,
        name: batch.name,
        startDate: bsToDate(batch.startDateBs),
        currentTermNumber: batch.currentTermNumber,
        isActive: batch.isActive,
      });
    }
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: (formData: T_BatchSchema) =>
      updateBatch({ data: formData, id: id! }),
    onSuccess: () => {
      toast.success("Batch updated successfully.");
      navigate("/batch");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message || "Failed to update batch.");
    },
  });

  const onSubmit = (values: T_BatchSchema) => {
    updateMutation.mutate(values);
  };

  if (isLoading) return <ScreenLoader />;

  if (isError) {
    return (
      <div className="p-6">
        <AlertHandler
          variant="error"
          title="Error"
          message="Failed to fetch batch details."
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <PageHeader
        title="Edit Batch"
        description="Update batch information and status."
        backPage="/batch"
        backPageTitle="Back to Batches"
        breadCrumbItems={[
          { title: "Batches", link: "/batch" },
          { title: "Edit" },
        ]}
      />

      <div>
        <div>
          <div>Batch Information</div>
          <div>Modify the details below.</div>
        </div>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2081 Fall" {...field} />
                    </FormControl>
                    <FormDescription>Display name for this batch/intake.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        options={courses.map((c) => ({
                          label: `${c.code ?? ""}${c.code ? " - " : ""}${c.name ?? c.id}`,
                          value: c.id,
                          searchValues: `${c.code ?? ""} ${c.name ?? ""}`,
                        }))}
                        placeholder={coursesQuery.isLoading ? "Loading courses..." : "Select course..."}
                        searchPlaceholder="Search courses..."
                        loading={coursesQuery.isLoading}
                      />
                    </FormControl>
                    <FormDescription>Select course (ID reference, unlimited options).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Start Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        valueFormat="ad"
                        lang="en"
                      />
                    </FormControl>
                    <FormDescription>
                      Selected date is converted to Bikram Sambat on save.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentTermNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Term Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber)
                        }
                      />
                    </FormControl>
                    <FormDescription>Current term/semester number for this batch.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Active Status</FormLabel>
                    <FormControl>
                      <InputWithSwitch
                        value={!!field.value}
                        onChange={field.onChange}
                        labels={{ on: "Active", off: "Inactive" }}
                      />
                    </FormControl>
                    <FormDescription>Enable this batch for active operations.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Link to="/batch">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  loading={updateMutation.isPending}
                  disabled={updateMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
