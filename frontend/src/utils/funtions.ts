import type { Muscle } from "@/types/Core";

export const formatDataTimeISO = (dt?: string) => {
  try {
    if (!dt) return "-";
    const date = dt.split("T")[0];
    const time = dt.split("T")[1].split(".")[0];
    return `${date} ${time}`;
  } catch (_error) {
    console.log(_error);

    return dt;
  }
};

export const formatMuscleTitle = (muscle?: Muscle) => {
  if (!muscle) return undefined;
  return `${muscle.shortname} - ${muscle.title}`;
};
