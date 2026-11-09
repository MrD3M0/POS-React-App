import { z } from "zod";

const bsDateOptional = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use BS date YYYY-MM-DD")
  .optional()
  .or(z.literal(""));

export const noticeCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  body: z.string().trim().min(1, "Body content is required"),
  attachmentUrl: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  expiresOnBs: bsDateOptional,
  isPinned: z.boolean(),
  isPublished: z.boolean(),
});

export type NoticeCreateFormValues = z.infer<typeof noticeCreateSchema>;

export const noticeCreateDefaultValues: NoticeCreateFormValues = {
  title: "",
  body: "",
  attachmentUrl: "",
  expiresOnBs: "",
  isPinned: false,
  isPublished: true,
};
