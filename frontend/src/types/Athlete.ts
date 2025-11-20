import type { DataModel } from "@toolpad/core/Crud";
import type { Profile } from "./Profile";

export interface AthleteLevel {
  id?: number;
  name: string;
  number: number;
  description?: string;
}

export interface Athlete extends DataModel {
  id: number;
  firstname: string;
  lastname: string;
  name: string;
  coach: Profile & number;
  level: AthleteLevel & number;
  patronymic: string;
  birth_year: string;
  picture: string | File;
  sport_type: string;
  created_at: string;
  updated_at: string;
}

export interface AthleteParams {
  id?: number;
  athlete: Athlete & number;
  bmi: number;
  weight: number;
  height: number;
  created_at?: string;
  description?: string;
}
