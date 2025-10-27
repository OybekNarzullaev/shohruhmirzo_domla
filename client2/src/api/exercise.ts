import api from "../config/api";
import type { Exercise } from "../types/Core";
import type { Pagination } from "../types/Pagination";

export const createExerciseAPI = async (params: {
  signal_length: number;
  first_count: number;
  last_count: number;
  training: number;
  description: string;
}): Promise<Exercise> => {
  const { data } = await api.post(`/exercises/`, params);
  return data;
};

export const listExercisesAPI = async (
  training_id: number | string
): Promise<Pagination<Exercise>> => {
  const { data } = await api.get(`/exercises/?training_id=${training_id}`);
  return data;
};

export const deleteExerciseAPI = async (id: number): Promise<Exercise> => {
  const { data } = await api.delete(`/exercises/${id}/`);
  return data;
};
