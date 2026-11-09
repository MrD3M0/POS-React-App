import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import { BsDatePicker } from "@/components/bs-datepicker";
import SelectCommand from "@/components/select-command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import { getOwnStaff } from "../profile/edit/service/service";
import { applyLeave, listLeaveTypes, listMyLeaves, type T_LEAVE_ATTENDANCE, type T_LEAVE_TYPE } from "./service/service";
import { staffLeaveDefaultValues, staffLeaveSchema, type StaffLeaveFormValues } from "./schema/schema";

const LIMIT = 20;

export default function StaffLeavePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const staffQuery = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PROFILE],
    queryFn: getOwnStaff,
  });
  const staff = staffQuery.data?.data as Record<string, unknown> | undefined;
  const employeeId = (staff?.employeeId ?? (staff?.employee as Record<string, unknown> | undefined)?.id) as string | undefined;

  const listQuery = useQuery({
    queryKey: [QUERY_KEYS.STAFF_ATTENDANCE, "leave", employeeId, page, search],
    queryFn: () => listMyLeaves({ page, limit: LIMIT, search, employeeId }),
    enabled: !!employeeId,
  });

  const typesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LOOKUP_LEAVE, "staff-select", "unlimited"],
    queryFn: () => listLeaveTypes({ page: 1, limit: 999 }),
  });

  const form = useForm<StaffLeaveFormValues>({
    resolver: zodResolver(staffLeaveSchema),
    defaultValues: staffLeaveDefaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: StaffLeaveFormValues) =>
      applyLeave({
        employeeId: employeeId!,
        dateBs: data.dateBs,
        leaveTypeId: data.leaveTypeId?.trim() ? data.leaveTypeId.trim() : undefined,
        remarks: data.remarks?.trim() ? data.remarks.trim() : undefined,
      }),
    onSuccess: () => {
      toast.success("Leave applied successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.STAFF_ATTENDANCE, "leave"] });
      form.reset(staffLeaveDefaultValues);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to apply leave.");
    },
  });

  if (staffQuery.isLoading) return <ScreenLoader />;
  if (staffQuery.isError || !employeeId) return <AlertHandler variant="error" />;
  if (listQuery.isLoading) return <ScreenLoader />;
  if (listQuery.isError) return <AlertHandler variant="error" />;

  const raw: T_LEAVE_ATTENDANCE[] = Array.isArray(listQuery.data?.data?.data)
    ? listQuery.data.data.data
    : Array.isArray(listQuery.data?.data)
      ? listQuery.data.data
      : [];
  const total = listQuery.data?.data?.pagination?.total ?? raw.length;

  const leaveTypes: T_LEAVE_TYPE[] = Array.isArray(typesQuery.data?.data?.data)
    ? typesQuery.data.data.data
    : Array.isArray(typesQuery.data?.data)
      ? typesQuery.data.data
      : [];
  const leaveTypeOptions = [
    { label: "None", value: "" },
    ...leaveTypes.map((t) => ({ label: `${t.name}${t.code ? ` (${t.code})` : ""}`, value: t.id, searchValues: `${t.name} ${t.code ?? ""}` })),
  ];

  const head: T_TableHead<T_LEAVE_ATTENDANCE>[] = [
    { key: "dateBs", headName: "Date (BS)", minWidth: 160 },
    { key: "leaveType", headName: "Leave Type", minWidth: 180, render: (r) => r.leaveType?.name ?? r.leaveType?.code ?? "—" },
    { key: "remarks", headName: "Remarks", minWidth: 240, render: (r) => r.remarks ?? "—" },
    { key: "status", headName: "Status", minWidth: 140, render: () => <Badge variant="secondary">LEAVE</Badge> },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="My Leave"
        breadCrumbItems={[
          { title: "Staff", link: "/staff/leave" },
          { title: "Leave", link: "/staff/leave" },
        ]}
      />

      <div className="mb-6 rounded-lg border p-4">
        <h2 className="mb-3 text-base font-semibold">Apply for Leave</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="Select leave date"
                        onChange={(value) => field.onChange(typeof value === "string" ? value : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Leave date in Bikram Sambat.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="leaveTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Leave Type</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        options={leaveTypeOptions}
                        placeholder={typesQuery.isLoading ? "Loading leave types..." : "Select leave type"}
                        searchPlaceholder="Search leave types..."
                        loading={typesQuery.isLoading}
                        isClearable
                      />
                    </FormControl>
                    <FormDescription>Select leave type (ID reference, unlimited options).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel isOptional>Remarks</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} placeholder="Reason for leave (optional)" />
                    </FormControl>
                    <FormDescription>Optional reason or note for this leave request.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={mutation.isPending}>
                Apply Leave
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <GenericTable
        tableHeads={head}
        data={raw}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search my leaves..."
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        emptyTitle="No leave requests found."
        renderRow={(r) => ({ dateBs: r.dateBs, remarks: r.remarks ?? "—" } as Record<string, React.ReactNode>)}
      />
    </div>
  );
}
