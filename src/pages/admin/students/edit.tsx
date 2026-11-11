import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import SelectCommand from "@/components/select-command";
import PageHeader from "@/components/common/page-header";
import { BsDatePicker } from "@/components/bs-datepicker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import { getStudentById, updateStudent, approveStudent, rejectStudent } from "./service/service";
import { listBatches } from "@/pages/admin/batches/service/service";
import {
  studentEditDefaultValues,
  studentEditSchema,
  type StudentEditFormValues,
} from "./schema/schema";

function toOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_STUDENT_GET, id],
    queryFn: () => getStudentById(id!),
    enabled: !!id,
  });

  const batchesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, "select", "unlimited"],
    queryFn: () => listBatches({ page: 1, limit: 999 }),
  });

  const batchOptions = (batchesQuery.data?.data?.data ?? []).map((b) => ({
    label: `${b.name}${b.course ? ` (${b.course.code})` : ""}`,
    value: b.id,
    searchValues: `${b.name} ${b.course?.code ?? ""} ${b.course?.name ?? ""}`,
  }));

  const form = useForm<StudentEditFormValues>({
    resolver: zodResolver(studentEditSchema),
    defaultValues: studentEditDefaultValues,
  });

  useEffect(() => {
    const s = query.data?.data;
    if (s) {
      form.reset({
        universityRegNo: s.universityRegNo,
        firstName: s.firstName,
        middleName: s.middleName ?? "",
        lastName: s.lastName,
        gender: s.gender ?? "MALE",
        dobBs: s.dobBs ?? "",
        phone: s.phone ?? "",
        email: s.email ?? "",
        permanentAddress: s.permanentAddress ?? "",
        temporaryAddress: s.temporaryAddress ?? "",
        batchId: s.batchId ?? "",
        admissionDateBs: s.admissionDateBs,
        status: s.status,
        approvalStatus: s.approvalStatus,
        rejectionReason: s.rejectionReason ?? "",
      });
    }
  }, [query.data, form]);

  const mutation = useMutation({
    mutationFn: (data: StudentEditFormValues) =>
      updateStudent(id!, {
        universityRegNo: data.universityRegNo.trim(),
        firstName: data.firstName.trim(),
        middleName: toOptional(data.middleName),
        lastName: data.lastName.trim(),
        gender: data.gender,
        dobBs: toOptional(data.dobBs),
        phone: toOptional(data.phone),
        email: toOptional(data.email),
        permanentAddress: toOptional(data.permanentAddress),
        temporaryAddress: toOptional(data.temporaryAddress),
        batchId: data.batchId,
        admissionDateBs: data.admissionDateBs,
        status: data.status,
        approvalStatus: data.approvalStatus,
        rejectionReason: toOptional(data.rejectionReason),
      }),
    onSuccess: () => {
      toast.success("Student updated successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_STUDENT_LIST] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_STUDENT_GET, id] });
      navigate("/admin/students");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to update student.");
    },
  });

  const approveMut = useMutation({
    mutationFn: () => approveStudent(id!),
    onSuccess: (result) => {
      const fee = result?.data?.feeAssignment;
      if (fee?.assigned) {
        toast.success(
          `Student approved. Fee assigned: ${fee.feeStructureName ?? "fee structure"} (NPR ${fee.total ?? "0"}).`,
        );
      } else if (fee?.message) {
        toast.warning(`Student approved. ${fee.message}`);
      } else {
        toast.success("Student approved.");
      }
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_STUDENT_LIST] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_STUDENT_GET, id] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_BILLING] });
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(error.response?.data?.message ?? "Failed to approve student.");
    },
  });

  const rejectMut = useMutation({
    mutationFn: () => rejectStudent(id!, rejectReason),
    onSuccess: () => {
      toast.success("Student rejected.");
      setShowRejectBox(false);
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_STUDENT_LIST] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_STUDENT_GET, id] });
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(error.response?.data?.message ?? "Failed to reject student.");
    },
  });

  if (query.isLoading || !query.data) return <ScreenLoader />;
  if (query.isError || !id) return <AlertHandler variant="error" />;

  const studentData = query.data.data;

  return (
    <div className="p-5">
      <PageHeader
        title="Edit Student"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Students", link: "/admin/students" },
          { title: "Edit", link: `/admin/students/edit/${id}` },
        ]}
        backPage="/admin/students"
      />

      <div className="mt-4 w-full space-y-4">
        <div className="border-l-4 border-l-primary rounded-r-md border border-border bg-muted/10">
          <div className="flex flex-row items-center justify-between px-6 py-3">
            <div>
              <div className="text-sm font-semibold">Approval Status</div>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={
                    studentData.approvalStatus === "APPROVED"
                      ? "default"
                      : studentData.approvalStatus === "REJECTED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {studentData.approvalStatus}
                </Badge>
                {studentData.rejectionReason && (
                  <span className="text-xs text-destructive">Reason: {studentData.rejectionReason}</span>
                )}
              </div>
            </div>
            {studentData.approvalStatus === "PENDING" && (
              <div className="flex gap-2">
                <Button size="sm" variant="primary" loading={approveMut.isPending} onClick={() => approveMut.mutate()}>
                  Approve Student
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setShowRejectBox((v) => !v)}>
                  Reject...
                </Button>
              </div>
            )}
          </div>
          {showRejectBox && (
            <div className="mt-2 space-y-2 border-t px-6 pb-4 pt-3">
              <label className="text-xs font-medium text-muted-foreground">Reason for Rejection *</label>
              <Textarea
                placeholder="Specify why student admission is rejected..."
                value={rejectReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowRejectBox(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={!rejectReason.trim() || rejectMut.isPending}
                  loading={rejectMut.isPending}
                  onClick={() => rejectMut.mutate()}
                >
                  Confirm Reject
                </Button>
              </div>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="universityRegNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University Reg. No.</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Official university registration number.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={field.onChange}
                        options={batchOptions}
                        placeholder={batchesQuery.isLoading ? "Loading batches..." : "Select batch"}
                        searchPlaceholder="Search batches..."
                        loading={batchesQuery.isLoading}
                      />
                    </FormControl>
                    <FormDescription>Assign the student to an active batch.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Student's given name.</FormDescription><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="middleName" render={({ field }) => (
                <FormItem><FormLabel isOptional>Middle Name</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional middle name.</FormDescription><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Student's family name.</FormDescription><FormMessage /></FormItem>
              )} />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={(v) => field.onChange(v as "MALE" | "FEMALE" | "OTHERS")}
                        options={[
                          { label: "Male", value: "MALE" },
                          { label: "Female", value: "FEMALE" },
                          { label: "Others", value: "OTHERS" },
                        ]}
                        placeholder="Select gender"
                        hideSearch
                      />
                    </FormControl>
                    <FormDescription>Gender (fixed options).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admissionDateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker value={field.value ?? ""} valueFormat="bs" lang="en" placeholder="Select admission date" onChange={(v) => field.onChange(typeof v === "string" ? v : "")} onBlur={field.onBlur} />
                    </FormControl>
                    <FormDescription>Admission date in Bikram Sambat.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dobBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Date of Birth (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker value={field.value ?? ""} valueFormat="bs" lang="en" placeholder="Select DOB" onChange={(v) => field.onChange(typeof v === "string" ? v : "")} onBlur={field.onBlur} />
                    </FormControl>
                    <FormDescription>Optional date of birth in Bikram Sambat.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel isOptional>Email</FormLabel><FormControl><Input type="email" {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional contact email.</FormDescription><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel isOptional>Phone</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional contact number.</FormDescription><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="permanentAddress" render={({ field }) => (
                <FormItem><FormLabel isOptional>Permanent Address</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional permanent address.</FormDescription><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="temporaryAddress" render={({ field }) => (
                <FormItem><FormLabel isOptional>Temporary Address</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional temporary/current address.</FormDescription><FormMessage /></FormItem>
              )} />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Status</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={(v) => field.onChange(v as StudentEditFormValues["status"])}
                        options={[
                          { label: "Active", value: "ACTIVE" },
                          { label: "Graduated", value: "GRADUATED" },
                          { label: "Dropped", value: "DROPPED" },
                          { label: "Suspended", value: "SUSPENDED" },
                        ]}
                        placeholder="Select status"
                        hideSearch
                      />
                    </FormControl>
                    <FormDescription>Academic/enrollment status (fixed options).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approvalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Status</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={(v) => field.onChange(v as StudentEditFormValues["approvalStatus"])}
                        options={[
                          { label: "Pending", value: "PENDING" },
                          { label: "Approved", value: "APPROVED" },
                          { label: "Rejected", value: "REJECTED" },
                        ]}
                        placeholder="Select approval status"
                        hideSearch
                      />
                    </FormControl>
                    <FormDescription>Changing this here updates the stored approval state; use Approve/Reject actions when pending.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/students">
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
