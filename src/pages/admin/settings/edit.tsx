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
import { Textarea } from "@/components/ui/textarea";
import ScreenLoader from "@/components/ui/screen-loader";
import AlertHandler from "@/components/common/alert-handler";
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
import { getSettingById, updateSetting } from "./service/service";
import { SETTING_CREATE_SCHEMA, type T_SETTING_CREATE } from "./schema/schema";

export default function EditSettingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SETTING_GET, id],
    queryFn: () => getSettingById(id!),
    enabled: !!id,
  });

  const form = useForm<T_SETTING_CREATE>({
    resolver: zodResolver(SETTING_CREATE_SCHEMA),
    defaultValues: { key: "", value: "", description: "" },
  });

  useEffect(() => {
    const s = query.data?.data;
    if (s) {
      form.reset({
        key: s.key,
        value: s.value,
        description: s.description ?? "",
      });
    }
  }, [query.data, form]);

  const mutation = useMutation({
    mutationFn: (data: T_SETTING_CREATE) =>
      updateSetting(id!, {
        value: data.value.trim(),
        description: data.description?.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Setting updated successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_SETTING_ALL] });
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_SETTING_GET, id] });
      navigate("/admin/settings");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to update setting.");
    },
  });

  if (query.isLoading) return <ScreenLoader />;
  if (query.isError || !id) return <AlertHandler variant="error" />;

  return (
    <div className="p-5">
      <PageHeader
        title="Edit Setting"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Settings", link: "/admin/settings" },
          { title: "Edit", link: `/admin/settings/edit/${id}` },
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
                    <Input disabled {...field} className="bg-muted cursor-not-allowed" />
                  </FormControl>
                  <FormDescription>Setting keys are immutable after creation.</FormDescription>
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
                    <Textarea placeholder="Enter setting value..." {...field} />
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
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
