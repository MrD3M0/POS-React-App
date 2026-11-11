// Keep in sync with `enum Role` in the backend schema.prisma
export type T_Role =
  "ADMIN" | "PRINCIPAL" | "ACCOUNTANT" | "TEACHER" | "STAFF" | "STUDENT";

export type AuthModel = {
  token?: string;
  refreshToken?: string;
  user?: UserModel;
};
export type UserModel = {
  id?: string;
  username?: string | null;
  email?: string;
  role?: T_Role;
  isEmailVerified?: boolean;
  /** Employee profile linked to the account (staff/teacher/principal/... roles). */
  employee?: {
    id?: string;
    employeeCode?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    designation?: string;
    phone?: string | null;
    /** Profile photo, shown in the sidebar user card. */
    photoUrl?: string | null;
  } | null;
  /** Student profile linked to the account. */
  student?: {
    id?: string;
    universityRegNo?: string;
    firstName?: string;
    middleName?: string | null;
    lastName?: string;
    phone?: string | null;
  } | null;
};

// Helper to get the access token from the auth object
export const getAuthToken = (auth?: AuthModel): string | undefined => {
  return auth?.token;
};
