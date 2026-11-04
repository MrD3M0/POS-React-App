import { z } from "zod";

export const SETTING_CREATE_SCHEMA = z.object({
  key: z.string().min(1).max(255),
  value: z.string().min(1),
  description: z.string().optional(),
});

export const SETTING_UPDATE_SCHEMA = SETTING_CREATE_SCHEMA.partial();

export type T_SETTING_CREATE = z.infer<typeof SETTING_CREATE_SCHEMA>;
export type T_SETTING_UPDATE = z.infer<typeof SETTING_UPDATE_SCHEMA>;
