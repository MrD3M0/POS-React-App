import type { AuthModel } from "@/lib/models";
import { createContext, useContext } from "react";

export interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  auth?: AuthModel;
  isAdmin: boolean;
  loading: boolean;
}

const defaultContext: AuthContextType = {
  login: async () => {},
  register: async () => {},
  auth: undefined,
  isAdmin: false,
  loading: true,
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);
