export type AuthModel = {
  token?: string;
  refreshToken?: string;
  user?: UserModel;
};
export type UserModel = {
  id?: number;
  username?: string;
  email?: string;
  role?: string;
};

// Helper to get token from auth object (supports both token and access_token)
export const getAuthToken = (auth?: AuthModel): string | undefined => {
  return auth?.token;
};
