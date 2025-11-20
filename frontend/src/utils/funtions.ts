export const formatDataTimeISO = (dt?: string) => {
  try {
    if (!dt) return "-";
    const date = dt.split("T")[0];
    const time = dt.split("T")[1].split(".")[0];
    return `${date} ${time}`;
  } catch (error) {
    return dt;
  }
};
