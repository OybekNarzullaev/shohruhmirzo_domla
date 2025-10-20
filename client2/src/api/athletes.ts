import api from "../config/api";
import { Athlete } from "../types/Athelete";

export const listAthletesAPI = () => api.get<Athlete[]>("/athletes/");
