import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router";
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
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
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
import {
  getAccountantById,
  listEmployeeOptions,
  updateAccountant,
} from "./service/service";

const LIST_ROUTE = "/accountant/accountants";

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Others", value: "OTHERS" },
];

const EditAccountant = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<T_AccountantSchema>({
    resolver: zodResolver(AccountantSchema),
    defaultValues: { ...AccountantDefaultValues },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTANT, id],
    queryFn: () => getAccountantById(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
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

  useEffect(() => {
    if (data?.data) {
      const acc = data.data as unknown as Record<string, unknown>;
      form.reset({
        employeeId: String(acc.employeeId ?? ""),
        firstName: String(acc.firstName ?? ""),
        lastName: acc.lastName != null ? String(acc.lastName) : "",
        email: String(acc.email ?? ""),
        designation: String(acc.designation ?? ""),
        gender: (acc.gender as "MALE" | "FEMALE" | "OTHERS") ?? "MALE",
        phone: acc.phone != null ? String(acc.phone) : "",
        isActive: Boolean(acc.isActive),
      });
    }
  }, [data, form]);

  // Only runs when the user actively picks a different employee,
  // so loading the saved record never overwrites stored values.
  const handleEmployeeChange = (
    value: string,
    onChange: (v: string) => void,
  ) => {
    onChange(value);
    const emp = employees.find((e) => e.id === value);
    if (!emp) return;
    const opts = { shouldValidate: true, shouldDirty: true } as const;
    form.setValue("firstName", emp.firstName ?? "", opts);
    form.setValue("lastName", emp.lastName ?? "", opts);
    form.setValue("email", emp.email ?? "", opts);
    form.setValue("designation", emp.designation ?? "", opts);
  };

  const mutation = useMutation({
    mutationFn: (formData: T_AccountantSchema) =>
      updateAccountant({ id: id!, data: formData }),
    onSuccess: () => {
      toast.success("Accountant updated successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT_LIST] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTANT, id] });
      navigate(LIST_ROUTE);
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(
        error.response?.data?.message ?? "Failed to update accountant.",
      );
    },
  });

  if (isLoading) return <ScreenLoader />;
  if (isError || !id) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Edit Accountant"
        description="Update the assigned accountant record."
        backPage={LIST_ROUTE}
        backPageTitle="Back to Accountants"
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Accountants", link: LIST_ROUTE },
          { title: "Edit" },
        ]}
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((formData) =>
              mutation.mutate(formData),
            )}
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
                      Select the linked employee record. Changing it refills
                      name, email, and designation.
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
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Given name.</FormDescription>
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
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Family name.</FormDescription>
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
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>Primary email.</FormDescription>
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
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Job title.</FormDescription>
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
                    <FormDescription>Fixed gender options.</FormDescription>
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
                      Inactive records are excluded from active operations.
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
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditAccountant;
