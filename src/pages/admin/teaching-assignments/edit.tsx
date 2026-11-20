import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Button from "@/components/ui/button";
import { BsDatePicker } from "@/components/bs-datepicker";
import { InputWithSwitch } from "@/components/input-with-switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { T_UseQueryError } from "@/types/common";
import { mapFieldsOnError } from "@/lib/utils";
import {
  getTeachingAssignment,
  updateTeachingAssignment,
  getTeacherWorkload,
} from "./service/service";

const bsDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format");

const editSchema = z
  .object({
    assignedDateBs: bsDate,
    endDateBs: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD (BS) format").or(z.literal("")),
    isActive: z.boolean(),
    closeSchedules: z.boolean(),
  })
  .refine(
    (data) => !data.endDateBs || data.endDateBs >= data.assignedDateBs,
    { message: "End date must be on or after the assigned date", path: ["endDateBs"] },
  );

type EditFormValues = z.infer<typeof editSchema>;

/**
 * Edit a teaching assignment: dates and active flag. When the end date is
 * brought forward the admin can also clamp the still-open weekly schedules
 * (closeSchedules flag handled by the backend).
 */
export default function EditTeachingAssignmentPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST, "detail", id],
    queryFn: () => getTeachingAssignment(id),
    enabled: Boolean(id),
  });

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { assignedDateBs: "", endDateBs: "", isActive: true, closeSchedules: false },
  });

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const row = query.data;
    if (!row || loaded) return;
    form.reset({
      assignedDateBs: row.assignedDateBs,
      endDateBs: row.endDateBs ?? "",
      isActive: row.isActive !== false,
      closeSchedules: false,
    });
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, loaded]);

  const teacherId = query.data?.teacherId ?? "";
  const workloadQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST, "workload", teacherId],
    queryFn: () => getTeacherWorkload(teacherId),
    enabled: Boolean(teacherId),
  });

  const watchedEndDate = form.watch("endDateBs");

  const mutation = useMutation({
    mutationFn: (data: EditFormValues) =>
      updateTeachingAssignment(id, {
        assignedDateBs: data.assignedDateBs,
        endDateBs: data.endDateBs.trim() || null,
        isActive: data.isActive,
        closeSchedules: data.closeSchedules,
      }),
    onSuccess: (result) => {
      const closed =
        (result as { data?: { closedSchedules?: number } })?.data?.closedSchedules ?? 0;
      toast.success(
        closed > 0
          ? `Assignment updated — ${closed} schedule${closed === 1 ? "" : "s"} closed on the end date.`
          : "Assignment updated successfully.",
      );
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST] });
      navigate("/admin/teaching-assignments");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to update assignment.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !query.data) return <AlertHandler variant="error" />;

  const workload = workloadQuery.data;

  return (
    <div className="p-5">
      <PageHeader
        title="Edit Teaching Assignment"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Teaching Assignments", link: "/admin/teaching-assignments" },
          { title: "Edit", link: `/admin/teaching-assignments/edit/${id}` },
        ]}
        backPage="/admin/teaching-assignments"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4"
          >
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
                    <FormDescription>
                      Setting an end date can also close this class's weekly schedule.
                    </FormDescription>
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
                    <FormDescription>Inactive assignments cannot take attendance.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedEndDate?.trim() ? (
                <FormField
                  control={form.control}
                  name="closeSchedules"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel isOptional>Weekly schedules</FormLabel>
                      <FormControl>
                        <InputWithSwitch
                          value={field.value}
                          onChange={field.onChange}
                          labels={{ on: "Close on end date", off: "Keep open" }}
                        />
                      </FormControl>
                      <FormDescription>
                        On: schedules that run past the end date stop on it. Off: they continue.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            <p className="text-xs text-muted-foreground">
              {workload
                ? `Workload: ${workload.assignedSubjects} subject${workload.assignedSubjects === 1 ? "" : "s"} · ${workload.weeklyScheduledPeriods} scheduled period${workload.weeklyScheduledPeriods === 1 ? "" : "s"} per week.`
                : null}
            </p>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/teaching-assignments">
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
