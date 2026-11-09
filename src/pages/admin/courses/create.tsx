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
import SelectCommand from "@/components/select-command";
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
import { createCourse } from "./service/service";
import { courseDefaultValues, courseSchema, type CourseFormValues } from "./schema/schema";

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: courseDefaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: CourseFormValues) =>
      createCourse({
        code: data.code.trim(),
        name: data.name.trim(),
        system: data.system,
        totalTerms: data.totalTerms,
        description: data.description?.trim() || undefined,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      toast.success("Course created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_COURSE_LIST] });
      navigate("/admin/courses");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create course.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Create Course"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Courses", link: "/admin/courses" },
          { title: "Create", link: "/admin/courses/create" },
        ]}
        backPage="/admin/courses"
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
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BIT, BBA, BSC CSIT" {...field} />
                    </FormControl>
                    <FormDescription>Short unique identifier used across the system.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bachelor of Information Technology" {...field} />
                    </FormControl>
                    <FormDescription>Full official course/program name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="system"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val as "SEMESTER" | "YEARLY");
                          if (val === "SEMESTER") form.setValue("totalTerms", 8);
                          else form.setValue("totalTerms", 4);
                        }}
                        options={[
                          { label: "Semester", value: "SEMESTER" },
                          { label: "Yearly", value: "YEARLY" },
                        ]}
                        placeholder="Select system"
                        hideSearch
                      />
                    </FormControl>
                    <FormDescription>Academic structure used by this course.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Terms (Semesters/Years)</FormLabel>
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
                    <FormDescription>Total number of terms required to complete the course.</FormDescription>
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
                    <Textarea placeholder="Short course description..." {...field} />
                  </FormControl>
                  <FormDescription>Optional summary for admins and reports.</FormDescription>
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
                  <FormDescription>Inactive courses are hidden from normal selection flows.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/courses">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Create Course
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
