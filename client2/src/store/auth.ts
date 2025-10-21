import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Profile } from "../types/Profile";

export interface Session {
  user: Profile;
}

interface SessionState {
  token: string | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  setSession: (session: Session | null) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      loading: true,
      error: null,
      token: null,

      setToken: (token) => set({ token, loading: false, error: null }),
      setSession: (session) => set({ session, loading: false, error: null }),
      setLoading: (loading) => set({ loading }),
      setError: (message) => set({ error: message }),
      clearSession: () =>
        set({ session: null, loading: false, token: null, error: null }),
    }),
    {
      name: "session-storage", // localStorage kaliti
      // 🧠 faqat sessionni saqlamaymiz:
      partialize: (state) => ({
        token: state.token,
        loading: state.loading,
        error: state.error,
      }),
    }
  )
);
