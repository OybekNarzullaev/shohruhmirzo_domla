import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the theme store interface
interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Create the Zustand store with persistence
const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false, // Default to light mode
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: "theme", // Key for localStorage
    }
  )
);

// Hook to use the theme store
export const useThemeSwitcher = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const rootElement = document.getElementsByTagName("html")[0];

  useEffect(() => {
    if (isDarkMode) {
      rootElement?.setAttribute("data-theme", "dark");
    } else rootElement?.setAttribute("data-theme", "light");
  }, [isDarkMode]);
  return { isDarkMode, toggleTheme };
};
