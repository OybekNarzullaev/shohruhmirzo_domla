// src/store/Muscle.ts
import { listMusclesAPI } from "@/api/muscle";
import type { Muscle } from "@/types/Core";
import { useEffect } from "react";
import { create } from "zustand";

interface MuscleState {
  muscles: Muscle[];
  setMuscles: (muscles: Muscle[]) => void;
  setLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

const useMuscleStore = create<MuscleState>((set) => ({
  muscles: [],
  isLoading: true,
  setMuscles: (muscles) => set((state) => ({ ...state, muscles })),
  setLoading: (isLoading) => set((state) => ({ ...state, isLoading })),
}));

export const useMuscles = () => {
  const { isLoading, muscles, setMuscles, setLoading } = useMuscleStore();

  useEffect(() => {
    if (muscles.length === 0)
      listMusclesAPI()
        .then((response) => setMuscles(response))
        .finally(() => setLoading(false));
    else {
      setLoading(false);
    }
  }, []);

  return {
    isLoading,
    muscles,
  };
};
