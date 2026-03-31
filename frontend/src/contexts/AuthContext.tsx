import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { postApi } from "../api/client";
import type { LoginRequest, LoginResponse } from "../types";

interface AuthContextType {
  token: string | null;
  roles: string[];
  isLoggedIn: boolean;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [roles, setRoles] = useState<string[]>(
    () => {
      const stored = localStorage.getItem("roles");
      return stored ? JSON.parse(stored) : [];
    }
  );

  const login = useCallback(async (req: LoginRequest) => {
    const res = await postApi<LoginResponse>("/auth/login", req);
    localStorage.setItem("token", res.token);
    localStorage.setItem("roles", JSON.stringify(res.roles));
    setToken(res.token);
    setRoles(res.roles);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    setToken(null);
    setRoles([]);
  }, []);

  return (
    <AuthContext.Provider value={{ token, roles, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
