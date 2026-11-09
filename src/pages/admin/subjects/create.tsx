import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { createSubject } from "./service/service";
import { subjectCreateDefaultValues, subjectCreateSchema, type SubjectCreateFormValues } from "./schema/schema";

export default function CreateSubjectPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<SubjectCreateFormValues>({
    resolver: zodResolver(subjectCreateSchema),
    defaultValues: subjectCreateDefaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: SubjectCreateFormValues) =>
      createSubject({
        code: data.code.trim(),
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      toast.success("Subject created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_SUBJECT_LIST] });
      navigate("/admin/subjects");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create subject.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Create Subject"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Subjects", link: "/admin/subjects" },
          { title: "Create", link: "/admin/subjects/create" },
        ]}
        backPage="/admin/subjects"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CSC101, MTH201" {...field} />
                    </FormControl>
                    <FormDescription>Unique subject code used in curricula and exams.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Data Structures & Algorithms" {...field} />
                    </FormControl>
                    <FormDescription>Official subject title.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isOptional>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Overview of the subject syllabus..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>Optional syllabus summary.</FormDescription>
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
                    <InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Active", off: "Inactive" }} />
                  </FormControl>
                  <FormDescription>Inactive subjects are hidden from normal selection flows.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/subjects">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Create Subject
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
