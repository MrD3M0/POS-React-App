import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "@/components/common/page-header";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { BsDatePicker } from "@/components/bs-datepicker";
import { InputWithSwitch } from "@/components/input-with-switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { T_UseQueryError } from "@/types/common";
import { mapFieldsOnError } from "@/lib/utils";
import {
  createClassSchedule,
  listPeriodOptions,
  listTeachingAssignmentOptions,
  type T_PERIOD_OPTION,
  type T_TEACHING_ASSIGNMENT_OPTION,
} from "./service/service";
import {
  classScheduleCreateDefaultValues,
  classScheduleCreateSchema,
  type ClassScheduleCreateFormValues,
} from "./schema/schema";

const DAYS = [
  { value: "SUNDAY", label: "Sunday" },
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
] as const;

function assignmentLabel(a: T_TEACHING_ASSIGNMENT_OPTION) {
  const e = a.teacher?.employee;
  const name = e ? [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ") : "";
  const subject = a.batchTermSubject?.subject
    ? `${a.batchTermSubject.subject.code ?? ""}${a.batchTermSubject.subject.name ? ` - ${a.batchTermSubject.subject.name}` : ""}`.trim()
    : "";
  const batch = a.batchTermSubject?.batchTerm?.batch?.name ?? "";
  return [name, subject, batch].filter(Boolean).join(" • ") || a.id;
}

function periodLabel(p: T_PERIOD_OPTION) {
  return `${p.name} (${p.startTime}–${p.endTime})`;
}

export default function CreateClassSchedulePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();

  // "Schedule this class" links from Teaching Assignments pass ?assignmentId=.
  const prefilledAssignmentId = searchParams.get("assignmentId") ?? "";
  const prefilledPeriodId = searchParams.get("periodId") ?? "";
  const prefilledDay = searchParams.get("dayOfWeek") ?? "";
  const isDay = (value: string): value is ClassScheduleCreateFormValues["dayOfWeek"] =>
    DAYS.some((day) => day.value === value);

  const form = useForm<ClassScheduleCreateFormValues>({
    resolver: zodResolver(classScheduleCreateSchema),
    defaultValues: {
      ...classScheduleCreateDefaultValues,
      teachingAssignmentId: prefilledAssignmentId,
      periodId: prefilledPeriodId,
      ...(isDay(prefilledDay) ? { dayOfWeek: prefilledDay } : {}),
    },
  });

  const assignmentsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEACHING_ASSIGNMENT_LIST, "select", "unlimited"],
    queryFn: () => listTeachingAssignmentOptions({ page: 1, limit: -1 }),
  });
  const periodsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LOOKUP_PERIOD, "select", "unlimited"],
    queryFn: () => listPeriodOptions({ page: 1, limit: -1 }),
  });

  const assignmentOptions = (assignmentsQuery.data?.data?.data ?? [])
    .filter((a) => a.isActive !== false)
    .map((a) => ({
      label: assignmentLabel(a),
      value: a.id,
      searchValues: assignmentLabel(a),
    }));
  const periodOptions = (periodsQuery.data?.data?.data ?? [])
    .filter((p) => p.isActive !== false)
    .map((p) => ({
      label: periodLabel(p),
      value: p.id,
      searchValues: periodLabel(p),
    }));

  const mutation = useMutation({
    mutationFn: (data: ClassScheduleCreateFormValues) =>
      createClassSchedule({
        teachingAssignmentId: data.teachingAssignmentId,
        periodId: data.periodId,
        dayOfWeek: data.dayOfWeek,
        room: data.room?.trim() || undefined,
        effectiveFromBs: data.effectiveFromBs,
        effectiveToBs: data.effectiveToBs?.trim() || undefined,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      toast.success("Class schedule created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CLASS_SCHEDULE_LIST] });
      navigate("/admin/class-schedules");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create class schedule.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Create Class Schedule"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Class Schedules", link: "/admin/class-schedules" },
          { title: "Create", link: "/admin/class-schedules/create" },
        ]}
        backPage="/admin/class-schedules"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="teachingAssignmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teaching Assignment</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={field.onChange}
                        options={assignmentOptions}
                        placeholder={assignmentsQuery.isLoading ? "Loading assignments..." : "Select assignment..."}
                        searchPlaceholder="Search teacher, subject or batch..."
                        loading={assignmentsQuery.isLoading}
                      />
                    </FormControl>
                    <FormDescription>Select the teacher / subject / batch assignment to schedule.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={field.onChange}
                        options={periodOptions}
                        placeholder={periodsQuery.isLoading ? "Loading periods..." : "Select period..."}
                        searchPlaceholder="Search periods..."
                        loading={periodsQuery.isLoading}
                      />
                    </FormControl>
                    <FormDescription>Select the period for this schedule.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={field.onChange}
                        options={DAYS.map((d) => ({ label: d.label, value: d.value }))}
                        placeholder="Select day..."
                        hideSearch
                      />
                    </FormControl>
                    <FormDescription>Day of the week this schedule applies to.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Room</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Room 101" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Room where this class takes place.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveFromBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From (BS)</FormLabel>
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
                    <FormDescription>First BS date this schedule applies.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveToBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Effective To (BS)</FormLabel>
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
                    <FormDescription>Optional last BS date; leave blank for open-ended.</FormDescription>
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
                    <FormDescription>Inactive schedules are not used in calendar views.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/class-schedules">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Create Schedule
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
