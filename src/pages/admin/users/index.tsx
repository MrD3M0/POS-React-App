import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import PageHeader from "@/components/common/page-header";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import PasswordInput from "@/components/ui/password-input";
import GenericTable, { type T_TableHead } from "@/components/generic-table";
import ConfirmDeleteDialog from "@/components/dialog/delete-dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { T_UseQueryError } from "@/types/common";
import type { ReactNode } from "react";

import { listEmployees, deleteEmployee, resetUserPassword } from "./service/service";
import type { T_EMPLOYEE } from "./service/service";

const LIMIT = 10;

export default function AdminEmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<{ userId: string; name: string } | null>(null);

  const listQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_EMPLOYEE_LIST, search, page],
    queryFn: () => listEmployees({ page, limit: LIMIT, search }),
  });

  if (listQuery.isLoading) return <ScreenLoader />;
  if (listQuery.isError) return <AlertHandler variant="error" />;

  const rows: T_EMPLOYEE[] = listQuery.data?.data?.data ?? [];
  const total = listQuery.data?.data?.pagination?.total ?? 0;

  const tableHeads: T_TableHead<T_EMPLOYEE>[] = [
    { key: "employeeCode", headName: "Code" },
    { key: "firstName", headName: "Name", render: (e) => [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ") || "—" },
    { key: "designation", headName: "Designation" },
    { key: "email", headName: "Email" },
    { key: "role", headName: "Role", render: (e) => <Badge variant="outline">{e.role ?? e.user?.role ?? "—"}</Badge> },
  ];

  return (
    <div className="p-5">
      <PageHeader
        title="Users"
        breadCrumbItems={[{ title: "Admin", link: "/admin/users" }, { title: "Users", link: "/admin/users" }]}
        createPage="/admin/users/create"
        createPageTitle="New User"
      />

      <GenericTable
        tableHeads={tableHeads}
        data={rows}
        onDelete={(emp) => { setDeleteId(emp.id); }}
        renderActions={(emp) => {
          const userId = emp.user?.id || emp.userId || undefined;
          const name = [emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(" ") || emp.employeeCode;
          return (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              title={userId ? "Change password" : "No linked user account"}
              disabled={!userId}
              onClick={() => userId && setPasswordTarget({ userId, name })}
            >
              <KeyRound className="size-3.5" />
            </Button>
          );
        }}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        emptyTitle="No users found."
        renderRow={(emp) => ({ email: emp.email ?? emp.user?.email ?? "—" } as Record<string, ReactNode>)}
        pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        searchPlaceholder="Search by name..."
      />

      {deleteId && (
        <ConfirmDeleteDialog
          open
          onOpenChange={(o) => !o && setDeleteId(null)}
          itemId={deleteId}
          onDelete={deleteEmployee}
          itemName="Employee"
        />
      )}
      {passwordTarget && (
        <ResetPasswordDialog
          userId={passwordTarget.userId}
          name={passwordTarget.name}
          onClose={() => setPasswordTarget(null)}
        />
      )}
    </div>
  );
}

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Confirm password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type T_ResetPassword = z.infer<typeof resetPasswordSchema>;

function ResetPasswordDialog({ userId, name, onClose }: { userId: string; name: string; onClose: () => void }) {
  const form = useForm<T_ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: T_ResetPassword) => resetUserPassword(userId, data.password),
    onSuccess: () => {
      toast.success("Password updated successfully.");
      onClose();
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      toast.error(error.response?.data?.message ?? "Failed to update password.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6">
        <h3 className="font-semibold">Change Password</h3>
        <p className="mt-1 text-sm text-muted-foreground">Set a new password for {name}.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="mt-4 space-y-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormDescription>Minimum 8 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormDescription>Re-enter the new password to confirm.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={mutation.isPending}>
                Update Password
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
