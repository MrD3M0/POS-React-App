import { getOwnStaff } from "../edit/service/service";

export { getOwnStaff };

export type T_STAFF_PROFILE = {
  id: string;
  department?: string | null;
  role?: string | null;
  isActive?: boolean | string | null;
  status?: string | null;
  email?: string | null;
  employee?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    employeeCode?: string;
    designation?: string | null;
    role?: string | null;
    email?: string | null;
    phone?: string | null;
    permanentAddress?: string | null;
    temporaryAddress?: string | null;
    isActive?: boolean | string | null;
    ssfNo?: string | null;
    bankAccountNo?: string | null;
    panNo?: string | null;
  } | null;
  [key: string]: unknown;
};

export type T_OWN_STAFF_RESPONSE = { data: T_STAFF_PROFILE };
