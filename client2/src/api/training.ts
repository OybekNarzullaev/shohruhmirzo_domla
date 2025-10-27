import api from "../config/api";
import type { TrainingSession } from "../types/Core";
import type { Pagination } from "../types/Pagination";

export const listTrainingSesssionsAPI = async (
  athlete_id: number | string
): Promise<Pagination<TrainingSession>> => {
  const { data } = await api.get(
    `/training-sessions/?athlete_id=${athlete_id}`
  );
  return data;
};

export const getTrainingSesssionAPI = async (
  id: number | string
): Promise<TrainingSession> => {
  const { data } = await api.get(`/training-sessions/${id}/`);
  return data;
};

export interface emtDataTrainingSesssionResponse {
  message: string;
  rows_count: number;
  columns: string[];
  signals: string[];
}

export const emtDataTrainingSesssionAPI = async (
  id: number | string
): Promise<emtDataTrainingSesssionResponse> => {
  const { data } = await api.get(`/training-sessions/${id}/emtData/`);
  return data;
};

export interface muscleFatigueGraphResponse {
  message: string;
  rows_count: number;
  columns: string[];
  signals: string[];
}

export const muscleFatigueGraphAPI = async (
  id: number | string,
  muscle_shortname: string
): Promise<muscleFatigueGraphResponse> => {
  const { data } = await api.get(
    `/training-sessions/${id}/muscleFatigueGraph/`,
    {
      params: {
        muscle: muscle_shortname,
      },
    }
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
