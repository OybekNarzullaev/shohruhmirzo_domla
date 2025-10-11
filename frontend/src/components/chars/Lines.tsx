import { LineChart } from "@mui/x-charts/LineChart";
import { type XAxis } from "@mui/x-charts/models";
import {
  dateAxisFormatter,
  percentageFormatter,
  usUnemploymentRate,
} from "./dataset";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

const xAxis: XAxis<"time">[] = [
  {
    dataKey: "date",
    scaleType: "time",
    valueFormatter: dateAxisFormatter,
  },
];
const yAxis = [
  {
    valueFormatter: percentageFormatter,
  },
];
const series = [
  {
    dataKey: "rate",
    showMark: false,
    valueFormatter: percentageFormatter,
  },
];
export function Lines() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Grafik</Typography>
      <LineChart
        dataset={usUnemploymentRate}
        xAxis={xAxis}
        yAxis={yAxis}
        series={series}
        height={300}
        grid={{ vertical: true, horizontal: true }}
      />
    </Paper>
  );
}
