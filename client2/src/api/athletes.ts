import api from "../config/api";
import type { Athlete, AthleteLevel, AthleteParams } from "../types/Athlete";
import type { Pagination } from "../types/Pagination";

const BASE_URL = "/athletes/";

export const getAthleteAPI = async (id: number | string): Promise<Athlete> => {
  const { data } = await api.get(`${BASE_URL}${id}/`);
  return data;
};

export const kLoadGraphAPI = async (
  id: number | string,
  muscle: string
): Promise<Athlete> => {
  const { data } = await api.get(`${BASE_URL}${id}/k_load_graph/`, {
    params: {
      muscle,
    },
  });
  return data;
};
export const listAthletesAPI = async (): Promise<Pagination<Athlete>> => {
  const { data } = await api.get(BASE_URL);
  return data;
};

export const createAthleteAPI = async (athlete: Partial<Athlete>) => {
  const { data } = await api.postForm(BASE_URL, athlete);
  return data;
};

export const updateAthleteAPI = async (
  id: number,
  athlete: Partial<Athlete>
) => {
  const { data } = await api.patch(`${BASE_URL}${id}/`, athlete);
  return data;
};

export const deleteAthleteAPI = async (id: number) => {
  await api.delete(`${BASE_URL}${id}/`);
};

export const listAthleteParamsAPI = async (
  athlete_id: number | string
): Promise<Pagination<AthleteParams>> => {
  const { data } = await api.get(`/athlete-params/?athlete_id=${athlete_id}`);
  return data;
};

export const createAthleteParamAPI = async (
  params: AthleteParams
): Promise<Pagination<AthleteParams>> => {
  const { data } = await api.post(`/athlete-params/`, params);
  return data;
};

export const editAthleteParamAPI = async (
  id: number,
  params: AthleteParams
): Promise<Pagination<AthleteParams>> => {
  const { data } = await api.put(`/athlete-params/${id}/`, params);
  return data;
};

export const deleteAthleteParamAPI = async (
  id: number
): Promise<Pagination<AthleteParams>> => {
  const { data } = await api.delete(`/athlete-params/${id}/`);
  return data;
};

export const listAthleteLevelsAPI = async (): Promise<AthleteLevel[]> => {
  const { data } = await api.get("/athlete-levels/");
  return data;
};
