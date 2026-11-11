import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { InputWithSwitch } from "@/components/input-with-switch";
import { BsDateTimePicker } from "@/components/bs-datetimepicker";
import SelectCommand from "@/components/select-command";
import type { T_MY_CLASS } from "../../my-classes/service/service";
import type {
  T_ATTENDANCE_ROSTER_ENTRY,
  T_ATTENDANCE_SESSION,
  T_PERIOD,
} from "../service/service";
import {
  attendanceSessionSchema,
  type AttendanceSessionValues,
} from "../schema";
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_META,
  isAttendanceStatus,
  type TAttendanceStatus,
} from "../../take-attendance/attendance-status";

export type AttendanceSessionSubmitValues = AttendanceSessionValues & {
  records: {
    studentId: string;
    status: TAttendanceStatus;
    remarks: string | null;
  }[];
};

function classLabel(c: T_MY_CLASS): string {
  const subject =
    c.subject?.code ?? c.subject?.name ?? c.subjectCode ?? c.subjectName ?? "";
  return (
    [c.batchName ?? c.batch?.name, subject, c.className]
      .filter(Boolean)
      .join(" / ") || c.id
  );
}

function studentLabel(entry: T_ATTENDANCE_ROSTER_ENTRY): string {
  const s = entry.student;
  const name = [s.firstName, s.middleName, s.lastName]
    .filter(Boolean)
    .join(" ");
  return name || s.universityRegNo || s.id;
}

function buildStatuses(
  roster: T_ATTENDANCE_ROSTER_ENTRY[],
): Record<string, TAttendanceStatus> {
  const next: Record<string, TAttendanceStatus> = {};
  for (const entry of roster) {
    const saved = entry.record?.status;
    next[entry.student.id] = isAttendanceStatus(saved) ? saved : "PRESENT";
  }
  return next;
}

export default function EditAttendanceSessionForm({
  record,
  classes,
  periods,
  roster,
  classesLoading,
  periodsLoading,
  rosterLoading,
  isPending,
  onCancel,
  onSubmit,
}: {
  record: T_ATTENDANCE_SESSION;
  classes: T_MY_CLASS[];
  periods: T_PERIOD[];
  roster: T_ATTENDANCE_ROSTER_ENTRY[];
  classesLoading?: boolean;
  periodsLoading?: boolean;
  rosterLoading?: boolean;
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (id: string, values: AttendanceSessionSubmitValues) => void;
}) {
  const form = useForm<AttendanceSessionValues>({
    resolver: zodResolver(attendanceSessionSchema),
    defaultValues: {
      teachingAssignmentId: record.teachingAssignmentId ?? "",
      periodId: record.periodId ?? "",
      dateBs: record.dateBs ?? "",
      isLocked: Boolean(record.isLocked ?? record.locked ?? false),
    },
  });

  // Roster arrives from an async query, so re-seed the local status map when it
  // changes (derived-state pattern instead of a state-syncing effect).
  const [loadedRoster, setLoadedRoster] = useState(roster);
  const [statuses, setStatuses] = useState<Record<string, TAttendanceStatus>>(
    () => buildStatuses(roster),
  );
  if (roster !== loadedRoster) {
    setLoadedRoster(roster);
    setStatuses(buildStatuses(roster));
  }

  function handleSubmit(values: AttendanceSessionValues) {
    const records = roster.map((entry) => {
      const status = statuses[entry.student.id] ?? "PRESENT";
      return {
        studentId: entry.student.id,
        status,
        remarks: (entry.record?.remarks ?? null) || null,
      };
    });
    onSubmit(record.id, { ...values, records });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
                    options={classes.map((c) => ({
                      label: classLabel(c),
                      value: c.id,
                      searchValues: classLabel(c),
                    }))}
                    placeholder="Select class..."
                    searchPlaceholder="Search classes..."
                    loading={classesLoading}
                  />
                </FormControl>
                <FormDescription>
                  Select the teaching assignment/class (ID reference).
                </FormDescription>
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
                    options={periods.map((p) => ({
                      label:
                        p.name ??
                        (p.periodNumber != null
                          ? `Period ${p.periodNumber}`
                          : p.id),
                      value: p.id,
                      searchValues: `${p.name ?? ""} ${p.periodNumber ?? ""}`,
                    }))}
                    placeholder="Select period..."
                    searchPlaceholder="Search periods..."
                    loading={periodsLoading}
                  />
                </FormControl>
                <FormDescription>
                  Select the period (ID reference).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateBs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date &amp; Time (BS)</FormLabel>
                <FormControl>
                  <BsDateTimePicker
                    value={field.value}
                    onChange={(v) =>
                      field.onChange(typeof v === "string" ? v : "")
                    }
                    valueFormat="bs"
                    lang="en"
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  Session date and time in Bikram Sambat.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isLocked"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Locked</FormLabel>
                <FormControl>
                  <InputWithSwitch
                    value={field.value}
                    onChange={field.onChange}
                    labels={{ on: "Locked", off: "Open" }}
                  />
                </FormControl>
                <FormDescription>
                  Lock the session to prevent attendance edits.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2 space-y-2">
            <FormLabel>Student Attendance</FormLabel>
            <FormDescription>
              Change any student&apos;s status between Present, Absent, Leave
              and Late, then click Update to save.
            </FormDescription>
            {rosterLoading ? (
              <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                Loading students…
              </p>
            ) : roster.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                No approved students found for this class.
              </p>
            ) : (
              <div className="divide-y overflow-hidden rounded-lg border">
                {roster.map((entry, index) => {
                  const student = entry.student;
                  const status = statuses[student.id] ?? "PRESENT";
                  return (
                    <div
                      key={student.id}
                      className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {index + 1}. {studentLabel(entry)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {student.universityRegNo ?? student.id}
                        </p>
                      </div>
                      <SelectCommand
                        value={status}
                        onChange={(value) =>
                          setStatuses((prev) => ({
                            ...prev,
                            [student.id]: (isAttendanceStatus(value)
                              ? value
                              : "PRESENT") as TAttendanceStatus,
                          }))
                        }
                        options={ATTENDANCE_STATUSES.map((code) => ({
                          label: ATTENDANCE_STATUS_META[code].label,
                          value: code,
                        }))}
                        hideSearch
                        disabled={isPending}
                        className="w-full sm:w-[160px]"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Update
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
