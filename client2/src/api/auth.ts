import api from "../config/api";
import type { Profile } from "../types/Profile";

export interface LoginResponse {
  token: string;
}

export const loginAPI = (username: string, password: string) =>
  api.post<LoginResponse>("/auth/login/", { username, password });

export const logoutAPI = () => api.post("/auth/logout/");

export const getProfileAPI = () => api.get<Profile>("/auth/profile/");
