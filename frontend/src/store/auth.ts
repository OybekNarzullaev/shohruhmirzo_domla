import { create } from "zustand";
import { login as apiLogin, logout as apiLogout, getProfile } from "@/api/auth";
import type { Profile } from "@/types/Profile";

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  token: string | null;
  isAuth: boolean;
  login: (username: string, password: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : undefined,
  isLoading: false,
  token: localStorage.getItem("token"),
  isAuth: !!localStorage.getItem("token"),

  async login(username, password) {
    set({ isLoading: true });
    try {
      const res = await apiLogin(username, password);
      const token = res.data.token;
      localStorage.setItem("token", token);
      set({ token, isAuth: true });
      const res2 = await getProfile();
      set({ user: res2.data });
    } catch (error) {
      console.log(error);
    } finally {
      set({ isLoading: false });
    }
  },

  async fetchProfile() {
    set({ isLoading: true });
    try {
      const res = await getProfile();
      set({ user: res.data });
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("Profilni yuklab bo‘lmadi", err);
    } finally {
      set({ isLoading: false });
    }
  },

  async logout() {
    set({ isLoading: true });
    try {
      await apiLogout();
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuth: false, isLoading: false });
    }
  },
}));
