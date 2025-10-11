import { create } from "zustand";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect } from "react";

type Store = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};
export const useSidebarStore = create<Store>((set) => {
  return {
    isOpen: true,
    open: () => set(() => ({ isOpen: true })),
    close: () => set(() => ({ isOpen: false })),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  };
});

export const useSidebar = () => {
  const theme = useTheme();
  const { isOpen, open, close, toggle } = useSidebarStore();

  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useMediaQuery(theme.breakpoints.only("xl"));
  const initialOpen = isLg || isXl;

  useEffect(() => {
    if (initialOpen) open();
    else close();
  }, []);

  return {
    isOpen,
    open,
    close,
    initialOpen,
    toggle,
  };
};
