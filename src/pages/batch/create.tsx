// pages/batch/create.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { type T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { InputWithSwitch } from "@/components/input-with-switch";
import PageHeader from "@/components/common/page-header";
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
import { BatchDefaultValues, BatchSchema } from "./schema/schema";
import { createBatch } from "./service/service";
import { BsDatePicker } from "@/components/bs-datepicker";

const CreateBatch = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const coursesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_COURSE_LIST, "batch-create", "unlimited"],
    queryFn: () => listCourses({ page: 1, limit: -1 }),
  });
  const courses = (coursesQuery.data?.data?.data ?? coursesQuery.data?.data ?? []) as Array<{
    id: string;
    code?: string;
    name?: string;
  }>;

  const form = useForm({
    resolver: zodResolver(BatchSchema),
    defaultValues: { ...BatchDefaultValues },
  });

  const createBatchMutation = useMutation({
    mutationFn: createBatch,
    onSuccess: () => {
      toast.success("Batch created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.BATCH_LIST] });
      navigate("/batch");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      return toast.error(error.response?.data.message);
    },
  });

  return (
    <div className="p-5">
      <title>Create Batch</title>
      <PageHeader
        title="Create Batch"
        breadCrumbItems={[
          { title: "Home", link: "/" },
          { title: "Batches", link: "/batch" },
          { title: "Create", link: "/batch/create" },
        ]}
      />

      <div className="px-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              createBatchMutation.mutate(data);
            })}
          >
            <div className="grid sm:grid-cols-2 grid-rows-1 sm:gap-x-3 gap-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Eg: 2081 Fall" {...field} />
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
                    <FormDescription>Optional batch start date (BS). Stored as BS date.</FormDescription>
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
                        placeholder="Eg: 1"
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
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <InputWithSwitch
                        value={!!field.value}
                        onChange={field.onChange}
                        labels={{ on: "Active", off: "Inactive" }}
                      />
                    </FormControl>
                    <FormDescription>Inactive batches are hidden from active workflows where applicable.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end items-center space-x-3 mb-5 mt-5">
              <Link to="/batch">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={createBatchMutation.isPending}
                >
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={createBatchMutation.isPending}>
                Create
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateBatch;
