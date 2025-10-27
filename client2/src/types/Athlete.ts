import type { DataModel } from "@toolpad/core/Crud";

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
  bmi?: number;
  weight: number;
  height: number;
  created_at?: string;
  description?: string;
}
