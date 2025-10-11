import api from "@/config/api";
import type { Profile } from "@/types/Profile";

export interface LoginResponse {
  token: string;
}

export const login = (username: string, password: string) =>
  api.post<LoginResponse>("/auth/login/", { username, password });

export const logout = () => api.post("/auth/logout/");

export const getProfile = () => api.get<Profile>("/auth/profile/");
