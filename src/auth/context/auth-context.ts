import { createContext, useContext } from "react";
import type { AuthModel, UserModel } from "@/lib/models";

export interface AuthContextType {
  login: (email: string, password: string) => Promise<AuthModel>;
  register: (username: string, email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  auth?: AuthModel;
  user?: UserModel;
  isAdmin: boolean;
  loading: boolean;
}

const defaultContext: AuthContextType = {
  login: async () => ({}),
  register: async () => "",
  auth: undefined,
  user: undefined,
  isAdmin: false,
  loading: true,
  logout: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);
