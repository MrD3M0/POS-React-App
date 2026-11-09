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
import { InputWithSwitch } from "@/components/input-with-switch";
import { BsDatePicker } from "@/components/bs-datepicker";
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
import { createNotice } from "./service/service";
import { noticeCreateDefaultValues, noticeCreateSchema, type NoticeCreateFormValues } from "./schema/schema";

export default function CreateNoticePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const form = useForm<NoticeCreateFormValues>({
    resolver: zodResolver(noticeCreateSchema),
    defaultValues: noticeCreateDefaultValues,
  });

  const mutation = useMutation({
    mutationFn: (data: NoticeCreateFormValues) =>
      createNotice({
        title: data.title.trim(),
        body: data.body.trim(),
        attachmentUrl: data.attachmentUrl?.trim() || undefined,
        expiresOnBs: data.expiresOnBs?.trim() || null,
        isPinned: data.isPinned,
        isPublished: data.isPublished,
      }),
    onSuccess: () => {
      toast.success("Notice created successfully.");
      qc.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_NOTICE_LIST] });
      navigate("/admin/notices");
    },
    onError: (error: AxiosError<T_UseQueryError>) => {
      mapFieldsOnError(error, form.setError);
      toast.error(error.response?.data?.message ?? "Failed to create notice.");
    },
  });

  return (
    <div className="p-5">
      <PageHeader
        title="Create Notice"
        breadCrumbItems={[
          { title: "Admin", link: "/admin" },
          { title: "Notices", link: "/admin/notices" },
          { title: "Create", link: "/admin/notices/create" },
        ]}
        backPage="/admin/notices"
      />

      <div className="mt-4 w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notice Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. End Semester Exam Schedule Released" {...field} />
                  </FormControl>
                  <FormDescription>Short, clear title shown in notice lists.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notice Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write the full notice announcement..." className="min-h-36" {...field} />
                  </FormControl>
                  <FormDescription>Full announcement text visible to target audiences.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="attachmentUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Attachment URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/document.pdf" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Optional link to a document or image.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresOnBs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isOptional>Expires On (BS)</FormLabel>
                    <FormControl>
                      <BsDatePicker
                        value={field.value ?? ""}
                        valueFormat="bs"
                        lang="en"
                        placeholder="Select expiry date (BS)"
                        onChange={(v) => field.onChange(typeof v === "string" ? v : "")}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormDescription>Optional expiry date in Bikram Sambat. After this date, published notices may no longer appear.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Status</FormLabel>
                    <FormControl>
                      <InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Published", off: "Draft" }} />
                    </FormControl>
                    <FormDescription>Published notices become visible based on backend rules.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPinned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pinned</FormLabel>
                    <FormControl>
                      <InputWithSwitch value={field.value} onChange={field.onChange} labels={{ on: "Pinned", off: "Normal" }} />
                    </FormControl>
                    <FormDescription>Pinned notices appear at the top.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Link to="/admin/notices">
                <Button type="button" variant="secondary" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={mutation.isPending}>
                Create Notice
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
