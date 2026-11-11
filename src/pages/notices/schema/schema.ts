import { z } from "zod";

const bsDateOptional = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use BS date YYYY-MM-DD")
  .optional()
  .or(z.literal(""));

export const noticeAudienceSchema = z
  .object({
    mode: z.enum(["EVERYONE", "TARGETED"]),
    roles: z.array(z.string()),
    batchIds: z.array(z.string()),
  })
  .superRefine((value, ctx) => {
    if (
      value.mode === "TARGETED" &&
      value.roles.length === 0 &&
      value.batchIds.length === 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["mode"],
        message: "Pick at least one role or class to target",
      });
    }
  });

export const noticeSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  body: z.string().trim().min(1, "Body content is required"),
  attachmentUrl: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  expiresOnBs: bsDateOptional,
  isPinned: z.boolean(),
  isPublished: z.boolean(),
  audience: noticeAudienceSchema,
});

export type NoticeFormValues = z.infer<typeof noticeSchema>;

export const noticeDefaultValues: NoticeFormValues = {
  title: "",
  body: "",
  attachmentUrl: "",
  expiresOnBs: "",
  isPinned: false,
  isPublished: true,
  audience: { mode: "EVERYONE", roles: [], batchIds: [] },
};
