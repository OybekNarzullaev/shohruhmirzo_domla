import api from "../config/api";
import { SportType } from "../types/Core";

export const listSportTypesAPI = async () => {
  const { data } = await api.get<SportType[]>(`/sport-types/`);
  return data;
};
