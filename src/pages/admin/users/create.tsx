import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
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

import { EMPLOYEE_CREATE_SCHEMA, EMPLOYEE_ROLES, type T_EMPLOYEE_CREATE } from "./schema/schema";
import { createEmployee } from "./service/service";

function toOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const CreateUserPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<T_EMPLOYEE_CREATE>({
    resolver: zodResolver(EMPLOYEE_CREATE_SCHEMA),
    defaultValues: {
      employeeCode: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "MALE",
      role: "STAFF",
      dobBs: "",
      phone: "",
      email: "",
      password: "",
      permanentAddress: "",
      temporaryAddress: "",
      designation: "",
      joinDateBs: "",
      panNo: "",
      ssfNo: "",
      bankName: "",
      bankAccountNo: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: T_EMPLOYEE_CREATE) =>
      createEmployee({
        employeeCode: data.employeeCode.trim(),
        firstName: data.firstName.trim(),
        middleName: toOptional(data.middleName),
        lastName: data.lastName.trim(),
        gender: data.gender,
        role: data.role,
        dobBs: toOptional(data.dobBs),
        phone: toOptional(data.phone),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        permanentAddress: toOptional(data.permanentAddress),
        temporaryAddress: toOptional(data.temporaryAddress),
        designation: data.designation.trim(),
        joinDateBs: data.joinDateBs,
        panNo: toOptional(data.panNo),
        ssfNo: toOptional(data.ssfNo),
        bankName: toOptional(data.bankName),
        bankAccountNo: toOptional(data.bankAccountNo),
      }),
    onSuccess: () => {
      toast.success("User created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_LIST] });
      navigate("/admin/users");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create user.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Create User"
        breadCrumbItems={[
          { title: "Admin", link: "/admin/users" },
          { title: "Users", link: "/admin/users" },
          { title: "Create", link: "/admin/users/create" },
        ]}
        backPage="/admin/users"
      />

      <div className="px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
            <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2">
              <FormField
                control={form.control}
                name="employeeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. EMP-001" {...field} />
                    </FormControl>
                    <FormDescription>Unique employee identifier/code.</FormDescription>
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
                      <Input placeholder="e.g. Teacher" {...field} />
                    </FormControl>
                    <FormDescription>Job title/designation for this user.</FormDescription>
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
                    <FormDescription>Given/first name.</FormDescription>
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
                    <FormDescription>Family/last name.</FormDescription>
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
                    <FormDescription>Select gender (fixed enum).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={field.onChange}
                        options={EMPLOYEE_ROLES.map((role) => ({
                          label: role.charAt(0) + role.slice(1).toLowerCase(),
                          value: role,
                        }))}
                        placeholder="Select role"
                        hideSearch
                      />
                    </FormControl>
                    <FormDescription>System role used for access and permissions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joinDateBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Join Date (BS)</FormLabel>
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
                    <FormDescription>Employee join date in Bikram Sambat (YYYY-MM-DD).</FormDescription>
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
                        placeholder="Select date of birth (BS)"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Login and contact email address.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormDescription>Minimum 8 characters.</FormDescription>
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
                name="panNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>PAN No.</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Optional PAN number.</FormDescription>
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
                    <FormDescription>Optional SSF number.</FormDescription>
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
                    <FormDescription>Optional bank name.</FormDescription>
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
                    <FormDescription>Optional bank account number.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-5 mb-5 flex items-center justify-end gap-3">
              <Link to="/admin/users">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Create
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateUserPage;
