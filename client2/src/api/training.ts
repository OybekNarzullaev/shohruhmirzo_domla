import api from "../config/api";
import { TrainingSession } from "../types/Core";
import { Pagination } from "../types/Pagination";

export const listTrainingSesssionsAPI = async (
  athlete_id: number | string
): Promise<Pagination<TrainingSession>> => {
  const { data } = await api.get(
    `/training-sessions/?athlete_id=${athlete_id}`
  );
  return data;
};

export const createTrainingSessionAPI = async (
  params: TrainingSession
): Promise<Pagination<TrainingSession>> => {
  const { data } = await api.postForm(`/training-sessions/`, params);
  return data;
};

export const editTrainingSessionAPI = async (
  id: number,
  params: TrainingSession
): Promise<Pagination<TrainingSession>> => {
  const { data } = await api.put(`/training-sessions/${id}/`, params);
  return data;
};

export const deleteTrainingSessionAPI = async (
  id: number
): Promise<Pagination<TrainingSession>> => {
  const { data } = await api.delete(`/training-sessions/${id}/`);
  return data;
};
