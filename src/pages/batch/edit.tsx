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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Button  from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/form";
import { BsDatePicker } from "@/components/bs-datepicker";

export default function EditBatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
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

      <Card>
        <CardHeader>
          <CardTitle>Batch Information</CardTitle>
          <CardDescription>Modify the details below.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course ID (UUID)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. c1234567-89ab-cdef-0123-456789abcdef"
                        {...field}
                      />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Status</FormLabel>
                      <FormDescription>
                        Enable this batch for active operations.
                      </FormDescription>
                    </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
