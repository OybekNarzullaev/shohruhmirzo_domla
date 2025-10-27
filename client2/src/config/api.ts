import axios, { type AxiosError, type AxiosInstance } from "axios";

import { useSessionStore } from "../store/auth";
import { toast } from "react-toastify";

const setupInterceptors = (api: AxiosInstance) => {
  // 🔹 Request Interceptor — tokenni headerga qo‘shadi
  api.interceptors.request.use(
    (config) => {
      const token = useSessionStore.getState()?.token;
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 🔹 Response Interceptor — xatoliklarni boshqarish
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<any>) => {
      const { response } = error;

      if (!response) {
        toast.error("Server bilan aloqa yo‘q.");
      } else if (response.status === 401) {
        const { clearSession } = useSessionStore.getState();
        clearSession();
        toast.info("Sessiya tugadi. Qayta tizimga kiring.");
      } else if (response.status >= 500) {
        toast.error("Serverda xatolik yuz berdi.");
      } else if ((response.data as any)?.message) {
        toast.error((response.data as any).message);
      }

      return Promise.reject(error);
    }
  );
};

const api: AxiosInstance = axios.create({
  baseURL: `${(import.meta as any).env.VITE_API_URL}/api/`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

setupInterceptors(api);

export default api;
