import type { AuthModel } from "@/lib/models";

export interface AuthContextType {
  login: (email: string, password: string) => Promise<AuthModel>;
  register: (username: string, email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  auth?: AuthModel;
  user?: UserModel;
  isAdmin: boolean;
  loading: boolean;
}

// Re-export UserModel for convenience
interface UserModel {
  id?: string;
  username?: string | null;
  email?: string;
  role?: T_Role;
}

type T_Role =
  | "ADMIN"
  | "PRINCIPAL"
  | "ACCOUNTANT"
  | "TEACHER"
  | "STAFF";

const defaultContext: AuthContextType = {
  login: async () => {},
  register: async () => "",
  auth: undefined,
  user: undefined,
  isAdmin: false,
  loading: true,
  logout: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

// Local import to avoid circular deps
import { createContext } from "react";

export const useAuth = () => useContext(AuthContext);
