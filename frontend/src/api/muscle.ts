import api from "../config/api";
import type { Muscle } from "../types/Core";

export const listMusclesAPI = async (
  training_id?: number | string,
  athlete_id?: number | string
): Promise<Muscle[]> => {
  const { data } = await api.get(`/muscles/`, {
    params: { training_id, athlete_id },
  });
  return data;
};
