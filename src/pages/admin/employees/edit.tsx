import { useEffect } from "react";
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
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import SelectCommand from "@/components/select-command";
import { InputWithSwitch } from "@/components/input-with-switch";
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
import { getEmployeeById, updateEmployee } from "./service/service";
import { employeeEditDefaultValues, employeeEditSchema, type EmployeeEditFormValues } from "./schema/schema";

function toOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_GET, id],
    queryFn: () => getEmployeeById(id!),
    enabled: !!id,
  });

  const form = useForm<EmployeeEditFormValues>({
    resolver: zodResolver(employeeEditSchema),
    defaultValues: employeeEditDefaultValues,
  });

  useEffect(() => {
    const e = query.data?.data;
    if (e) {
      form.reset({
        firstName: e.firstName,
        middleName: e.middleName ?? "",
        lastName: e.lastName ?? "",
        gender: e.gender ?? "MALE",
        designation: e.designation,
        dobBs: e.dobBs ?? "",
        email: e.email ?? "",
        phone: e.phone ?? "",
        permanentAddress: e.permanentAddress ?? "",
        temporaryAddress: e.temporaryAddress ?? "",
        joinDateBs: e.joinDateBs ?? "",
        panNo: e.panNo ?? "",
        ssfNo: e.ssfNo ?? "",
        bankName: e.bankName ?? "",
        bankAccountNo: e.bankAccountNo ?? "",
        isActive: e.isActive ?? true,
      });
    }
  }, [query.data, form]);

  const mutation = useMutation({
    mutationFn: (data: EmployeeEditFormValues) =>
      updateEmployee(id!, {
        firstName: data.firstName.trim(),
        middleName: toOptional(data.middleName),
        lastName: data.lastName.trim(),
        gender: data.gender,
        designation: data.designation.trim(),
        dobBs: toOptional(data.dobBs),
        email: toOptional(data.email)?.toLowerCase(),
        phone: toOptional(data.phone),
        permanentAddress: toOptional(data.permanentAddress),
        temporaryAddress: toOptional(data.temporaryAddress),
        joinDateBs: toOptional(data.joinDateBs),
        panNo: toOptional(data.panNo),
        ssfNo: toOptional(data.ssfNo),
        bankName: toOptional(data.bankName),
        bankAccountNo: toOptional(data.bankAccountNo),
        isActive: data.isActive,
      }),
    onSuccess: () => {
      toast.success("Employee updated successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_LIST] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_GET, id] });
      navigate("/admin/employees");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to update employee.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !id) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Edit Employee"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Employees", link: "/admin/employees" },
          { title: "Edit", link: `/admin/employees/edit/${id}` },
        ]}
        backPage="/admin/employees"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Employee's given name.</FormDescription>
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
                    <FormDescription>Employee's family name.</FormDescription>
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
                        onChange={field.onChange}
                        options={[
                          { label: "Male", value: "MALE" },
                          { label: "Female", value: "FEMALE" },
                          { label: "Others", value: "OTHERS" },
                        ]}
                        placeholder="Select gender"
                        hideSearch
                      />
                    </FormControl>
                    <FormDescription>Gender selection (fixed options).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Job title or position.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joinDateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Join Date (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="Select join date (BS)"
                        onChange={(value) => field.onChange(typeof value === "string" ? value : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Employment start date in Bikram Sambat.</FormDescription>
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
                    <FormDescription>Date of birth in Bikram Sambat.</FormDescription>
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
                    <FormDescription>Contact/login email (if applicable).</FormDescription>
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
                    <FormDescription>Primary contact number.</FormDescription>
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
                    <FormDescription>Permanent residential address.</FormDescription>
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
                    <FormDescription>Current/temporary address, if different.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="panNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>PAN No.</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Permanent Account Number for tax records.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ssfNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>SSF No.</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Social Security Fund number, if enrolled.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Bank used for salary/payments.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankAccountNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Bank Account No.</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Account number for disbursements.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Active", off: "Inactive" }} />
                  </FormControl>
                  <FormDescription>Inactive employees are excluded from active operations.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/employees">
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
