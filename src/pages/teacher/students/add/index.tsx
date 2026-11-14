import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import PageHeader from "@/components/common/page-header";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { BsDatePicker } from "@/components/bs-datepicker";
import SelectCommand from "@/components/select-command";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import { getAllBatches, type T_Batch } from "@/pages/batch/service/service";
import { createStudent } from "../service/service";
import { createTeacherStudentSchema, type CreateTeacherStudentValues } from "./schema";

function toOptional(value: string | undefined) {
  const t = value?.trim();
  return t ? t : undefined;
}

export default function AddStudentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const form = useForm<CreateTeacherStudentValues>({
    resolver: zodResolver(createTeacherStudentSchema),
    defaultValues: {
      firstName: "", middleName: "", lastName: "", universityRegNo: "", gender: "MALE",
      dobBs: "", admissionDateBs: "", batchId: "", phone: "", email: "", permanentAddress: "", temporaryAddress: "",
      guardianRelation: "FATHER", guardianName: "", guardianPhone: "", guardianEmail: "", guardianOccupation: "", guardianAddress: "",
    },
  });
  const guardianRelation = form.watch("guardianRelation");

  const batchQuery = useQuery({ queryKey: [QUERY_KEYS.ADMIN_BATCH_LIST, "teacher-options", "unlimited"], queryFn: () => getAllBatches({ page: 1, limit: -1 }) });
  const batchOptions = useMemo(() => {
    const raw = batchQuery.data as unknown as { data?: T_Batch[] | { data?: T_Batch[] } };
    const rows: T_Batch[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.data?.data) ? raw.data.data : [];
    return rows.map((b) => ({ label: `${b.name}${b.course?.code ? ` (${b.course.code})` : ""}`.trim(), value: b.id, searchValues: `${b.name} ${b.course?.code ?? ""} ${b.course?.name ?? ""}` }));
  }, [batchQuery.data]);

  const mutation = useMutation({
    mutationFn: async (values: CreateTeacherStudentValues) => createStudent({
      firstName: values.firstName.trim(),
      middleName: toOptional(values.middleName),
      lastName: values.lastName.trim(),
      universityRegNo: values.universityRegNo.trim(),
      gender: values.gender,
      dobBs: toOptional(values.dobBs),
      admissionDateBs: values.admissionDateBs,
      batchId: values.batchId,
      phone: toOptional(values.phone),
      email: toOptional(values.email),
      permanentAddress: toOptional(values.permanentAddress),
      temporaryAddress: toOptional(values.temporaryAddress),
      guardian: {
        relation: values.guardianRelation,
        fullName: values.guardianName.trim(),
        phone: toOptional(values.guardianPhone),
        email: toOptional(values.guardianEmail),
        occupation: toOptional(values.guardianOccupation),
        address: toOptional(values.guardianAddress),
      },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.TEACHER_STUDENTS] });
      toast.success("Student added — pending approval.");
      navigate("/teacher/students");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to add student.");
    },
  });

  return (
    <div className="space-y-4 p-5">
      <PageHeader
        title="Add Student"
        description="While pending or rejected you can edit. The student is not available in attendance, fees, exams, or results until approved."
        backPage="/teacher/students"
        backPageTitle="Back to Students"
        breadCrumbItems={[
          { title: "Teacher", link: "/teacher/students" },
          { title: "Students", link: "/teacher/students" },
          { title: "Add" },
        ]}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Student's given name.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="middleName" render={({ field }) => (
              <FormItem><FormLabel isOptional>Middle Name</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional middle name.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="lastName" render={({ field }) => (
              <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Student's family name.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="universityRegNo" render={({ field }) => (
              <FormItem><FormLabel>University Reg. No.</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Official university registration number.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem><FormLabel>Gender</FormLabel><FormControl>
                <SelectCommand value={field.value} onChange={field.onChange} options={[{ label: "Male", value: "MALE" }, { label: "Female", value: "FEMALE" }, { label: "Others", value: "OTHERS" }]} placeholder="Select gender" hideSearch />
              </FormControl><FormDescription>Fixed gender options.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="batchId" render={({ field }) => (
              <FormItem><FormLabel>Batch</FormLabel><FormControl>
                <SelectCommand value={field.value} onChange={field.onChange} options={batchOptions} placeholder={batchQuery.isLoading ? "Loading batches..." : "Select batch"} searchPlaceholder="Search batches..." loading={batchQuery.isLoading} />
              </FormControl><FormDescription>Select batch (ID reference, unlimited options).</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="admissionDateBs" render={({ field }) => (
              <FormItem><FormLabel>Admission Date (BS)</FormLabel><FormControl>
                <BsDatePicker value={field.value} onChange={(v) => field.onChange(typeof v === "string" ? v : "")} valueFormat="bs" lang="en" placeholder="Select admission date" />
              </FormControl><FormDescription>Admission date in Bikram Sambat.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dobBs" render={({ field }) => (
              <FormItem><FormLabel isOptional>Date of Birth (BS)</FormLabel><FormControl>
                <BsDatePicker value={field.value ?? ""} onChange={(v) => field.onChange(typeof v === "string" ? v : "")} valueFormat="bs" lang="en" placeholder="Select DOB" />
              </FormControl><FormDescription>Optional date of birth in BS.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel isOptional>Phone</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional contact number.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel isOptional>Email</FormLabel><FormControl><Input type="email" {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional email address.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="permanentAddress" render={({ field }) => (
              <FormItem><FormLabel isOptional>Permanent Address</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional permanent address.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="temporaryAddress" render={({ field }) => (
              <FormItem><FormLabel isOptional>Temporary Address</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional temporary address.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="guardianRelation" render={({ field }) => (
              <FormItem><FormLabel>Guardian Relation</FormLabel><FormControl>
                <SelectCommand value={field.value} onChange={field.onChange} options={[{ label: "Father", value: "FATHER" }, { label: "Mother", value: "MOTHER" }, { label: "Guardian", value: "GUARDIAN" }, { label: "Other", value: "OTHER" }]} placeholder="Select relation" hideSearch />
              </FormControl><FormDescription>Primary guardian relationship.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="guardianName" render={({ field }) => (
              <FormItem><FormLabel>{guardianRelation} Name</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Guardian's full name.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="guardianPhone" render={({ field }) => (
              <FormItem><FormLabel isOptional>Guardian Phone</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional guardian contact.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="guardianEmail" render={({ field }) => (
              <FormItem><FormLabel isOptional>Guardian Email</FormLabel><FormControl><Input type="email" {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional guardian email.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="guardianOccupation" render={({ field }) => (
              <FormItem><FormLabel isOptional>Occupation</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional guardian occupation.</FormDescription><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="guardianAddress" render={({ field }) => (
              <FormItem><FormLabel isOptional>Guardian Address</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormDescription>Optional guardian address.</FormDescription><FormMessage /></FormItem>
            )} />
          </div>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => navigate("/teacher/students")} disabled={mutation.isPending}>Cancel</Button>
            <Button type="submit" variant="primary" loading={mutation.isPending}>Add Student</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
