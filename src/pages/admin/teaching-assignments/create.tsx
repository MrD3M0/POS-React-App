import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import Button from "@/components/ui/button";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { T_UseQueryError } from "@/types/common";
import { mapFieldsOnError } from "@/lib/utils";
import {
  createTeachingAssignment,
  listTeachers,
  listBatchTermSubjects,
  type T_TEACHER_OPTION,
  type T_BATCH_TERM_SUBJECT_OPTION,
} from "./service/service";
import {
  teachingAssignmentCreateDefaultValues,
  teachingAssignmentCreateSchema,
  type TeachingAssignmentCreateFormValues,
} from "./schema/schema";

function teacherLabel(t: T_TEACHER_OPTION) {
  const e = t.employee;
  const name = [e?.firstName, e?.middleName, e?.lastName].filter(Boolean).join(" ");
  return name ? `${name}${e?.employeeCode ? ` (${e.employeeCode})` : ""}` : t.id;
}

function btsLabel(b: T_BATCH_TERM_SUBJECT_OPTION) {
  const subject = b.subject ? `${b.subject.code ?? ""}${b.subject.name ? ` - ${b.subject.name}` : ""}`.trim() : "";
  const term = b.batchTerm ? `Term ${b.batchTerm.termNumber ?? b.batchTerm.name ?? ""}` : "";
  const batch = b.batchTerm?.batch?.name ? ` • ${b.batchTerm.batch.name}` : "";
  return [subject, term].filter(Boolean).join(" / ") + batch || b.id;
}

export default function CreateTeachingAssignmentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<TeachingAssignmentCreateFormValues>({
    resolver: zodResolver(teachingAssignmentCreateSchema),
    defaultValues: teachingAssignmentCreateDefaultValues,
  });

  const teachersQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHER_LIST, "select", "unlimited"],
    queryFn: () => listTeachers({ page: 1, limit: 999 }),
  });
  const btsQuery = useQuery({
    queryKey: ["admin-batch-term-subjects", "select", "unlimited"],
    queryFn: () => listBatchTermSubjects({ page: 1, limit: 999 }),
  });

  const teacherOptions = (teachersQuery.data?.data?.data ?? []).map((t) => ({
    label: teacherLabel(t),
    value: t.id,
    searchValues: teacherLabel(t),
  }));
  const btsOptions = (btsQuery.data?.data?.data ?? []).map((b) => ({
    label: btsLabel(b),
    value: b.id,
    searchValues: btsLabel(b),
  }));

  const mutation = useMutation({
    mutationFn: (data: TeachingAssignmentCreateFormValues) =>
      createTeachingAssignment({
        teacherId: data.teacherId,
        batchTermSubjectId: data.batchTermSubjectId,
        assignedDateBs: data.assignedDateBs,
        endDateBs: data.endDateBs?.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Teaching assignment created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST] });
      navigate("/admin/teaching-assignments");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create teaching assignment.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Create Teaching Assignment"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Teaching Assignments", link: "/admin/teaching-assignments" },
          { title: "Create", link: "/admin/teaching-assignments/create" },
        ]}
        backPage="/admin/teaching-assignments"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={field.onChange}
                      options={teacherOptions}
                      placeholder={teachersQuery.isLoading ? "Loading teachers..." : "Select teacher..."}
                      searchPlaceholder="Search teachers..."
                      loading={teachersQuery.isLoading}
                    />
                  </FormControl>
                  <FormDescription>Select the teacher to assign (ID/reference selection).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batchTermSubjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Term Subject</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={field.onChange}
                      options={btsOptions}
                      placeholder={btsQuery.isLoading ? "Loading subjects..." : "Select subject / term..."}
                      searchPlaceholder="Search subjects or terms..."
                      loading={btsQuery.isLoading}
                    />
                  </FormControl>
                  <FormDescription>Select the subject offering for a batch term (ID/reference selection).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="assignedDateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="Select date"
                        onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Assignment start date in Bikram Sambat.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>End Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="Optional end date"
                        onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Optional assignment end date in BS.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/teaching-assignments">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Create Assignment
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
