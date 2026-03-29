import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { postApi } from "../api/client";
import type { LoginRequest, LoginResponse } from "../types";

interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );

  const login = useCallback(async (req: LoginRequest) => {
    const res = await postApi<LoginResponse>("/auth/login", req);
    localStorage.setItem("token", res.token);
    setToken(res.token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
