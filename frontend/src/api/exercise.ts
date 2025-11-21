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
  training_id: number | string,
  params?: {
    page?: number;
    page_size?: number;
  }
): Promise<Pagination<Exercise>> => {
  const queryParams = new URLSearchParams();

  queryParams.append("training_id", String(training_id));

  if (params?.page) {
    queryParams.append("page", String(params.page));
  }

  if (params?.page_size) {
    queryParams.append("page_size", String(params.page_size));
  }

  const { data } = await api.get<Pagination<Exercise>>(
    `/exercises/?${queryParams.toString()}`
  );

  return data;
};

export const deleteExerciseAPI = async (id: number): Promise<Exercise> => {
  const { data } = await api.delete(`/exercises/${id}/`);
  return data;
};
