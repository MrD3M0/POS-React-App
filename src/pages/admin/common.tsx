import { createContext, useContext } from "react";

// Shared option key for admin list pages; keep one source of truth across modules.
export const ADMIN_MODULES = [
  "employees",
  "students",
  "lookups",
  "notices",
  "audit",
] as const;

export type AdminModule = (typeof ADMIN_MODULES)[number];
