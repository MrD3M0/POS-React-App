import { useEffect } from "react";
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
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
import PageHeader from "@/components/common/page-header";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/form";
import { getOwnStaff, updateStaff } from "./service/service";
import { staffProfileEditDefaultValues, staffProfileEditSchema, type StaffProfileEditFormValues } from "./schema/schema";

export default function StaffProfileEditPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.STAFF_PROFILE],
    queryFn: getOwnStaff,
  });

  const form = useForm<StaffProfileEditFormValues>({
    resolver: zodResolver(staffProfileEditSchema),
    defaultValues: staffProfileEditDefaultValues,
  });

  const staff = query.data?.data;

  useEffect(() => {
    if (query.data?.data) {
      const s = query.data.data;
      const e = s.employee ?? {};
      form.reset({
        firstName: typeof e.firstName === "string" ? e.firstName : "",
        lastName: typeof e.lastName === "string" ? e.lastName : "",
        phone: typeof e.phone === "string" ? e.phone : "",
        address:
          typeof e.permanentAddress === "string"
            ? e.permanentAddress
            : typeof e.temporaryAddress === "string"
              ? e.temporaryAddress
              : "",
        department: typeof s.department === "string" ? s.department : "",
      });
    }
  }, [query.data, form]);

  const mutation = useMutation({
    mutationFn: (data: StaffProfileEditFormValues) =>
      updateStaff(staff!.id as string, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() ? data.phone.trim() : undefined,
        permanentAddress: data.address?.trim() ? data.address.trim() : undefined,
        temporaryAddress: data.address?.trim() ? data.address.trim() : undefined,
        department: data.department?.trim() ? data.department.trim() : undefined,
      }),
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.STAFF_PROFILE] });
      navigate("/staff/profile");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to update profile.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !staff?.id) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Edit Profile"
        breadCrumbItems={[
          { title: "Staff", link: "/staff/profile" },
          { title: "Edit Profile", link: "/staff/profile/edit" },
        ]}
        backPage="/staff/profile"
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
                    <FormDescription>Your given name.</FormDescription>
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
                    <FormDescription>Your family name.</FormDescription>
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Department</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Optional department/unit.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel isOptional>Address</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Optional address (saved as permanent/temporary where applicable).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/staff/profile">
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
