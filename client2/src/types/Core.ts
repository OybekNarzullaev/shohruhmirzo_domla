import type { Athlete } from "./Athlete";

export interface SportType {
  id?: number;
  name: string;
  number: number;
  description?: string;
}

export interface Muscle {
  id?: number;
  name: string;
  title: string;
  shortname: string;
  model_url: string;
  description: string;
}

export interface TrainingSession {
  id: number;
  title: string;
  athlete: Athlete | number;
  sport_type: SportType & number;
  pre_heart_rate: number;
  post_heart_rate: number;
  exercise_count: number;
  duration: number;
  file_EMT: string;
  file_ECG: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id?: number;
  first_count: number;
  last_count: number;
  training: TrainingSession & number;
  signal_length: number;
  hrate: number;
  description: string;
  muscles?: MuscleFatigue[];
  created_at: string;
  updated_at: string;
}

export interface MuscleFatigue {
  id?: number;
  exercise: Exercise & number;
  muscle: Muscle & number;
  fatigue: number;
}
