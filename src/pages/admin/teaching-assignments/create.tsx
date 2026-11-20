import { useMemo, useState } from "react";
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
  listBatches,
  listBatchTerms,
  getTeacherWorkload,
  type T_TEACHER_OPTION,
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

/** Subject label without the term/batch suffix — the cascade provides those. */
function subjectOnlyLabel(b: { subject?: { code?: string; name?: string } }) {
  const subject = b.subject
    ? `${b.subject.code ?? ""}${b.subject.name ? ` - ${b.subject.name}` : ""}`.trim()
    : "";
  return subject || "Subject";
}

/**
 * Create a teaching assignment through a cascading picker:
 * Batch → Semester (BatchTerm) → Subject (BatchTermSubject) → Teacher → dates.
 */
export default function CreateTeachingAssignmentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<TeachingAssignmentCreateFormValues>({
    resolver: zodResolver(teachingAssignmentCreateSchema),
    defaultValues: teachingAssignmentCreateDefaultValues,
  });

  // Cascade state — not form fields; batchTermSubjectId is the real payload.
  const [batchId, setBatchId] = useState("");
  const [batchTermId, setBatchTermId] = useState("");

  const batchesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, "select", "unlimited"],
    queryFn: () => listBatches({ page: 1, limit: -1 }),
  });
  const termsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TERM_LIST, "select", batchId],
    queryFn: () => listBatchTerms({ page: 1, limit: -1, batchId }),
    enabled: Boolean(batchId),
  });
  const subjectsQuery = useQuery({
    queryKey: ["admin-batch-term-subjects", "select", batchTermId],
    queryFn: () =>
      listBatchTermSubjects({ page: 1, limit: -1, batchTermId }),
    enabled: Boolean(batchTermId),
  });
  const teachersQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHER_LIST, "select", "unlimited"],
    queryFn: () => listTeachers({ page: 1, limit: -1 }),
  });

  const watchedTeacherId = form.watch("teacherId");
  const watchedBtsId = form.watch("batchTermSubjectId");

  const workloadQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST, "workload", watchedTeacherId],
    queryFn: () => getTeacherWorkload(watchedTeacherId),
    enabled: Boolean(watchedTeacherId),
  });

  const batchOptions = (batchesQuery.data?.data?.data ?? []).map((b) => ({
    label: b.name ?? b.id,
    value: b.id,
    searchValues: b.name ?? "",
  }));
  const termOptions = (termsQuery.data?.data?.data ?? []).map((t) => ({
    label: t.name ?? `Term ${t.termNumber ?? ""}`,
    value: t.id,
    searchValues: `Term ${t.termNumber ?? ""} ${t.name ?? ""}`,
  }));
  const subjectOptions = (subjectsQuery.data?.data?.data ?? []).map((b) => ({
    label: subjectOnlyLabel(b),
    value: b.id,
    searchValues: subjectOnlyLabel(b),
  }));
  const teacherOptions = (teachersQuery.data?.data?.data ?? []).map((t) => ({
    label: teacherLabel(t),
    value: t.id,
    searchValues: teacherLabel(t),
  }));

  // Teachers already assigned to the picked subject.
  const assignedTeachers = useMemo(() => {
    const row = (subjectsQuery.data?.data?.data ?? []).find((b) => b.id === watchedBtsId);
    const names = (row?.assignments ?? [])
      .map((a) => {
        const e = a.teacher?.employee;
        return e
          ? [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ")
          : null;
      })
      .filter(Boolean) as string[];
    return names;
  }, [subjectsQuery.data, watchedBtsId]);

  const pickBatch = (id: string) => {
    setBatchId(id);
    setBatchTermId("");
    form.setValue("batchTermSubjectId", "");
  };
  const pickTerm = (id: string) => {
    setBatchTermId(id);
    form.setValue("batchTermSubjectId", "");
  };

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

  const workload = workloadQuery.data;

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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItem>
                <FormLabel>Batch</FormLabel>
                <FormControl>
                  <SelectCommand
                    value={batchId}
                    onChange={pickBatch}
                    options={batchOptions}
                    placeholder={batchesQuery.isLoading ? "Loading batches..." : "Select batch..."}
                    searchPlaceholder="Search batches..."
                    loading={batchesQuery.isLoading}
                  />
                </FormControl>
                <FormDescription>Pick the batch, then the semester, then the subject.</FormDescription>
              </FormItem>

              <FormItem>
                <FormLabel>Semester / Year</FormLabel>
                <FormControl>
                  <SelectCommand
                    value={batchTermId}
                    onChange={pickTerm}
                    options={termOptions}
                    placeholder={!batchId ? "Pick a batch first" : termsQuery.isLoading ? "Loading terms..." : "Select term..."}
                    searchPlaceholder="Search terms..."
                    loading={termsQuery.isLoading}
                    disabled={!batchId}
                  />
                </FormControl>
                <FormDescription>Terms of the selected batch.</FormDescription>
              </FormItem>

              <FormField
                control={form.control}
                name="batchTermSubjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={field.onChange}
                        options={subjectOptions}
                        placeholder={!batchTermId ? "Pick a term first" : subjectsQuery.isLoading ? "Loading subjects..." : "Select subject..."}
                        searchPlaceholder="Search subjects..."
                        loading={subjectsQuery.isLoading}
                        disabled={!batchTermId}
                      />
                    </FormControl>
                    <FormDescription>Subjects assigned to the selected term.</FormDescription>
                    {assignedTeachers.length > 0 ? (
                      <FormDescription>
                        Already assigned: {assignedTeachers.join(", ")}
                      </FormDescription>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormDescription>
                      {workload
                        ? `${workload.assignedSubjects} subject${workload.assignedSubjects === 1 ? "" : "s"} assigned · ${workload.weeklyScheduledPeriods} period${workload.weeklyScheduledPeriods === 1 ? "" : "s"} scheduled weekly`
                        : "Current workload shows after picking a teacher."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
