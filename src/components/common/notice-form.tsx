import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputWithSwitch } from "@/components/input-with-switch";
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
import NoticeAudienceField from "@/components/common/notice-audience-field";
import {
  noticeDefaultValues,
  noticeSchema,
  type NoticeFormValues,
} from "@/pages/notices/schema/schema";
import {
  audienceToTargets,
  targetsToAudience,
  type T_NOTICE,
  type T_NOTICE_INPUT,
} from "@/pages/notices/service/service";

interface NoticeFormProps {
  /** Notice being edited (edit mode). */
  notice?: T_NOTICE | null;
  submitLabel?: string;
  isPending?: boolean;
  backPage: string;
  onSubmit: (input: T_NOTICE_INPUT) => void;
  /** Hides the publish switch (the notice is published by the author directly). */
  hidePublishSwitch?: boolean;
}

/**
 * Shared notice form. The audience rules depend on the signed-in role:
 * admin/principal/accountant may address everybody, a teacher only the classes
 * they teach.
 */
export default function NoticeForm({
  notice,
  submitLabel = "Create Notice",
  isPending,
  backPage,
  onSubmit,
  hidePublishSwitch,
}: NoticeFormProps) {
  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: noticeDefaultValues,
  });

  useEffect(() => {
    if (!notice) return;
    form.reset({
      title: notice.title ?? "",
      body: notice.body ?? notice.content ?? "",
      attachmentUrl: notice.attachmentUrl ?? "",
      expiresOnBs: notice.expiresOnBs ?? "",
      isPinned: notice.isPinned ?? false,
      isPublished: notice.isPublished ?? notice.published ?? false,
      audience: targetsToAudience(notice.targets),
    });
  }, [notice, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          onSubmit({
            title: values.title.trim(),
            body: values.body.trim(),
            attachmentUrl: values.attachmentUrl?.trim() || null,
            expiresOnBs: values.expiresOnBs?.trim() || null,
            isPinned: values.isPinned,
            isPublished: values.isPublished,
            targets: audienceToTargets(values.audience),
          }),
        )}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notice Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. End Semester Exam Schedule Released"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Short, clear title shown in notice lists and notifications.
              </FormDescription>
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
                <Textarea
                  placeholder="Write the full notice announcement..."
                  className="min-h-36"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Full announcement text visible to the target audience.
              </FormDescription>
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
                  <Input
                    placeholder="https://example.com/document.pdf"
                    {...field}
                    value={field.value ?? ""}
                  />
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
                    onChange={(v) =>
                      field.onChange(typeof v === "string" ? v : "")
                    }
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormDescription>
                  Optional expiry date in Bikram Sambat. After this date the
                  notice stops showing.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="audience"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NoticeAudienceField
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {hidePublishSwitch ? null : (
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Status</FormLabel>
                  <FormControl>
                    <InputWithSwitch
                      value={field.value}
                      onChange={field.onChange}
                      labels={{ on: "Published", off: "Draft" }}
                    />
                  </FormControl>
                  <FormDescription>
                    Published notices appear in the notification bell.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="isPinned"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pinned</FormLabel>
                <FormControl>
                  <InputWithSwitch
                    value={field.value}
                    onChange={field.onChange}
                    labels={{ on: "Pinned", off: "Normal" }}
                  />
                </FormControl>
                <FormDescription>Pinned notices are shown first.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Link to={backPage}>
            <Button type="button" variant="secondary" disabled={isPending}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isPending}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
