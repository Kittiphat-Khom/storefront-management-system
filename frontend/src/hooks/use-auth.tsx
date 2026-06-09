"use client";

import { apiFetch } from "@/src/helpers/api";
import { Role, User } from "@/src/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type LoginResponse = {
  access: string;
  refresh: string;
};

type AuthContextValue = {
  accessToken: string | null;
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    role: Role;
  }) => Promise<void>;
  logout: () => void;
  can: (role: Role) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async (token: string) => {
    const user = await apiFetch<User>("/api/auth/me/", { token });
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      const token = window.localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      setAccessToken(token);
      try {
        await loadMe(token);
      } catch {
        window.localStorage.removeItem("accessToken");
        setAccessToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const token = await apiFetch<LoginResponse>("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      window.localStorage.setItem("accessToken", token.access);
      setAccessToken(token.access);
      await loadMe(token.access);
      router.push("/");
    },
    [loadMe, router],
  );

  const register = useCallback(
    async (data: {
      email: string;
      username: string;
      password: string;
      role: Role;
    }) => {
      await apiFetch<User>("/api/auth/register/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      await login(data.email, data.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem("accessToken");
    setAccessToken(null);
    setCurrentUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      accessToken,
      currentUser,
      loading,
      login,
      register,
      logout,
      can: (role: Role) => currentUser?.role === role,
    }),
    [accessToken, currentUser, loading, login, logout, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
