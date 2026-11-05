// pages/batch/create.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

import { type T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import PageHeader from "@/components/common/page-header";

import {
  Form,
  FormControl,
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Eg: c1234567-89ab-cdef-0123-456789abcdef"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2 flex flex-row items-center space-x-3 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
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
