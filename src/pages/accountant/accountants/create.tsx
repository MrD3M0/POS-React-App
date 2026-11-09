import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import SelectCommand from "@/components/select-command";
import { InputWithSwitch } from "@/components/input-with-switch";
import PageHeader from "@/components/common/page-header";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import {
  AccountantSchema,
  AccountantDefaultValues,
  type T_AccountantSchema,
} from "./schema/schema";
import { createAccountant, listEmployeeOptions } from "./service/service";

const LIST_ROUTE = "/accountant/accountants";

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Others", value: "OTHERS" },
];

const CreateAccountant = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<T_AccountantSchema>({
    resolver: zodResolver(AccountantSchema),
    defaultValues: {
      ...AccountantDefaultValues,
      // Guard against undefined defaults (avoids uncontrolled -> controlled warnings)
      employeeId: AccountantDefaultValues.employeeId ?? "",
      firstName: AccountantDefaultValues.firstName ?? "",
      lastName: AccountantDefaultValues.lastName ?? "",
      email: AccountantDefaultValues.email ?? "",
      designation: AccountantDefaultValues.designation ?? "",
      phone: AccountantDefaultValues.phone ?? "",
    },
  });

  const employeesQuery = useQuery({
    queryKey: [
      QUERY_KEYS.ADMIN_EMPLOYEE_LIST,
      "accountant-select",
      "unlimited",
    ],
    queryFn: () => listEmployeeOptions({ page: 1, limit: 999 }),
  });

  const employees = useMemo(
    () => employeesQuery.data?.data?.data ?? [],
    [employeesQuery.data],
  );

  const employeeOptions = useMemo(
    () =>
      employees.map((e) => {
        const name = [e.firstName, e.lastName].filter(Boolean).join(" ").trim();
        const label = [
          name || e.id,
          e.employeeCode ? `(${e.employeeCode})` : "",
        ]
          .filter(Boolean)
          .join(" ");
        return {
          label,
          value: e.id,
          searchValues: `${label} ${e.email ?? ""} ${e.designation ?? ""}`,
        };
      }),
    [employees],
  );

  const handleEmployeeChange = (id: string, onChange: (v: string) => void) => {
    onChange(id);
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    const opts = { shouldValidate: true, shouldDirty: true } as const;
    form.setValue("firstName", emp.firstName ?? "", opts);
    form.setValue("lastName", emp.lastName ?? "", opts);
    form.setValue("email", emp.email ?? "", opts);
    form.setValue("designation", emp.designation ?? "", opts);
  };

  const mutation = useMutation({
    mutationFn: (data: T_AccountantSchema) => createAccountant(data),
    onSuccess: () => {
      toast.success("Accountant created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_LIST] });
      navigate(LIST_ROUTE);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(
        error.response?.data?.message ?? "Failed to create accountant.",
      );
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Add Accountant"
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Accountants", link: LIST_ROUTE },
          // Verify this route exists in your router; otherwise point it to LIST_ROUTE
          { title: "Create", link: "/accountant/create" },
        ]}
        backPage={LIST_ROUTE}
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
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <FormControl>
                      <SelectCommand
                        value={field.value}
                        onChange={(v: string) =>
                          handleEmployeeChange(v, field.onChange)
                        }
                        options={employeeOptions}
                        placeholder={
                          employeesQuery.isLoading
                            ? "Loading employees..."
                            : "Select employee..."
                        }
                        searchPlaceholder="Search employees..."
                        loading={employeesQuery.isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the employee record to link as accountant. Name,
                      email, and designation are filled in automatically.
                    </FormDescription>
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
                      <Input
                        placeholder="e.g. John"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>Accountant's given name.</FormDescription>
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
                      <Input
                        placeholder="e.g. Doe"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>Accountant's family name.</FormDescription>
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
                      <Input
                        type="email"
                        placeholder="e.g. john@university.edu"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Primary contact/login email.
                    </FormDescription>
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
                      <Input
                        placeholder="e.g. Senior Accountant"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>Job title or position.</FormDescription>
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
                        options={GENDER_OPTIONS}
                        placeholder="Select gender"
                        hideSearch
                      />
                    </FormControl>
                    <FormDescription>
                      Gender selection (fixed options).
                    </FormDescription>
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
                      <Input
                        placeholder="e.g. 98XXXXXXXX"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>Optional contact number.</FormDescription>
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
                    <FormDescription>
                      Inactive accountants are excluded from active operations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="secondary"
                disabled={mutation.isPending}
                onClick={() => navigate(LIST_ROUTE)}
              >
                Cancel
              </Button>
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

export default CreateAccountant;
