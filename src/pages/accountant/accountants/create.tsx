import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Mail, Phone, User } from "lucide-react";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import SelectCommand from "@/components/select-command";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
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
import { createAccountant, listEmployeeOptions, type T_EMPLOYEE_OPTION } from "./service/service";

const LIST_ROUTE = "/accountant/accountants";

const CreateAccountant = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [selectedEmployee, setSelectedEmployee] = useState<T_EMPLOYEE_OPTION | null>(null);

  const form = useForm<T_AccountantSchema>({
    resolver: zodResolver(AccountantSchema),
    defaultValues: { ...AccountantDefaultValues },
  });

  const employeesQuery = useQuery({
    queryKey: [
      QUERY_KEYS.ADMIN_EMPLOYEE_LIST,
      "accountant-select",
      "unlimited",
    ],
    queryFn: () => listEmployeeOptions({ page: 1, limit: -1 }),
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

  if (employeesQuery.isLoading) return <ScreenLoader />;

  return (
    <div className="p-5">
      <PageHeader
        title="Add Accountant"
        description="Link an existing employee record as the accountant."
        breadCrumbItems={[
          { title: "Accountant", link: "/accountant" },
          { title: "Accountants", link: LIST_ROUTE },
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
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <FormControl>
                    <SelectCommand
                      value={field.value}
                      onChange={(v: string) => {
                        field.onChange(v);
                        setSelectedEmployee(employees.find((e) => e.id === v) ?? null);
                      }}
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
                    Creating an accountant links an existing employee record.
                    Their name, email, designation, and contact details come
                    from the employee profile — edit those via Admin → Employees.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Read-only preview: everything else is derived from the employee record. */}
            {selectedEmployee ? (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Employee details (managed in the employee profile)
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {[selectedEmployee.firstName, selectedEmployee.lastName]
                      .filter(Boolean)
                      .join(" ") || selectedEmployee.id}
                  </span>
                  {selectedEmployee.employeeCode && (
                    <Badge variant="outline">{selectedEmployee.employeeCode}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedEmployee.designation || "—"}
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {selectedEmployee.email || "—"}
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {selectedEmployee.phone || "—"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select an employee above to preview the details that will be linked.
              </p>
            )}

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
