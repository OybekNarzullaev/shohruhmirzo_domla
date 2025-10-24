// src/store/network.ts
import { create } from "zustand";

interface NetworkState {
  isOnline: boolean;
  isFirstLoad: boolean;
  setOnline: (online: boolean) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: navigator.onLine,
  isFirstLoad: true,
  setOnline: (online) => set({ isOnline: online, isFirstLoad: false }),
}));
