import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { T_UseQueryError } from "@/types/common";
import { QUERY_KEYS } from "@/lib/query-keys";
import { mapFieldsOnError } from "@/lib/utils";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { createSetting } from "./service/service";
import { SETTING_CREATE_SCHEMA, type T_SETTING_CREATE } from "./schema/schema";

const settingCreateDefaults: T_SETTING_CREATE = {
  key: "",
  value: "",
  description: "",
};

export default function CreateSettingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<T_SETTING_CREATE>({
    resolver: zodResolver(SETTING_CREATE_SCHEMA),
    defaultValues: settingCreateDefaults,
  });

  const mutation = useMutation({
    mutationFn: (data: T_SETTING_CREATE) =>
      createSetting({
        key: data.key.trim(),
        value: data.value.trim(),
        description: data.description?.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Setting created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_SETTING_ALL] });
      navigate("/admin/settings");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create setting.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Create Setting"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Settings", link: "/admin/settings" },
          { title: "Create", link: "/admin/settings/create" },
        ]}
        backPage="/admin/settings"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setting Key</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ATTENDANCE_EDIT_HOURS, COLLEGE_NAME" {...field} />
                  </FormControl>
                  <FormDescription>Unique configuration key used by the system.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setting Value</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. 24" {...field} />
                  </FormControl>
                  <FormDescription>Value stored for this setting (format depends on the key).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel isOptional>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Explain the purpose of this configuration..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>Optional note for administrators.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/settings">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Save Setting
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
