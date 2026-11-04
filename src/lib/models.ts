// Keep in sync with `enum Role` in the backend schema.prisma
export type T_Role =
  | "ADMIN"
  | "PRINCIPAL"
  | "ACCOUNTANT"
  | "TEACHER"
  | "STAFF"
  | "STUDENT";

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
};

// Helper to get the access token from the auth object
export const getAuthToken = (auth?: AuthModel): string | undefined => {
  return auth?.token;
};
