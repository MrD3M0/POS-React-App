import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
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
import { createStudent } from "./service/service";
import { listBatches } from "@/pages/admin/batches/service/service";
import {
  studentCreateDefaultValues,
  studentCreateSchema,
  type StudentCreateFormValues,
} from "./schema/schema";

function toOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function CreateStudentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const batchesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, "select", "unlimited"],
    queryFn: () => listBatches({ page: 1, limit: 999 }),
  });

  const batchOptions = (batchesQuery.data?.data?.data ?? []).map((b) => ({
    label: `${b.name}${b.course ? ` (${b.course.code})` : ""}`,
    value: b.id,
    searchValues: `${b.name} ${b.course?.code ?? ""} ${b.course?.name ?? ""}`,
  }));

  const form = useForm<StudentCreateFormValues>({
    resolver: zodResolver(studentCreateSchema),
    defaultValues: studentCreateDefaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: StudentCreateFormValues) =>
      createStudent({
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
        approvalStatus: "APPROVED",
      }),
    onSuccess: () => {
      // The student starts PENDING: approving them is a separate step, and
      // that is where the college fee is assigned.
      toast.success(
        "Student created. Approve the student to admit them and assign the college fees.",
      );
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_STUDENT_LIST] });
      navigate("/admin/students");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create student.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Create Student"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Students", link: "/admin/students" },
          { title: "Create", link: "/admin/students/create" },
        ]}
        backPage="/admin/students"
      />

      <div className="mt-4 w-full">
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
                      <Input placeholder="e.g. TU-2081-001" {...field} />
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

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Student's given name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Optional middle name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Student's family name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="Select admission date (BS)"
                        onChange={(value) => field.onChange(typeof value === "string" ? value : "")}
                        onBlur={field.onBlur}
                      />
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
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="Select DOB (BS)"
                        onChange={(value) => field.onChange(typeof value === "string" ? value : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Optional date of birth in Bikram Sambat.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Optional contact email.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Optional contact number.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permanentAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Permanent Address</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Optional permanent address.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temporaryAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Temporary Address</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Optional temporary/current address.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Status</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={(v) => field.onChange(v as StudentCreateFormValues["status"])}
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
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/students">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Create Student
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
