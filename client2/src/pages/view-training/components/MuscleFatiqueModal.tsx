import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  TextField,
  Autocomplete,
  IconButton,
  Stack,
} from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import { useQuery } from "@tanstack/react-query";
import { muscleFatigueGraphAPI } from "../../../api/training";
import Plot from "react-plotly.js";
import type { Layout, Data } from "plotly.js";
import { listMusclesAPI } from "../../../api/muscle";
import type { Muscle } from "../../../types/Core";

interface Props {
  open: boolean;
  training_id: number | string;
  onClose: () => void;
}

export const MuscleFatiqueModal: React.FC<Props> = ({
  open = false,
  training_id,
  onClose,
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle | undefined>(
    undefined
  );
  const {
    data: muscles,
    refetch: refetchMuscles,
    isFetching,
  } = useQuery({
    queryKey: [training_id, "muscles"],
    queryFn: () => listMusclesAPI(training_id),
    refetchOnWindowFocus: false,
  });

  const {
    data = {},
    refetch,
    isLoading,
  } = useQuery({
    queryKey: [training_id, "muscle-fatigues"],
    queryFn: () =>
      muscleFatigueGraphAPI(training_id, selectedMuscle?.shortname as string),
    enabled: false,
  });

  const layout: Partial<Layout> = {
    title: { text: selectedMuscle?.title ?? "Grafik" },
    xaxis: { title: { text: "Ketma-ketlik" } },
    yaxis: { title: { text: "Charchoq qiymati" } },
    autosize: true,
    height: 500,
  };

  const { signals = {}, columns = [], rows_count = 0 } = data as any;
  const x = Array.from({ length: rows_count }, (_, i) => i);

  // Oddiy linear regressiya hisoblovchi funksiya
  const computeRegression = (xArr: number[], yArr: number[]) => {
    const n = xArr.length;
    const xMean = xArr.reduce((a, b) => a + b, 0) / n;
    const yMean = yArr.reduce((a, b) => a + b, 0) / n;

    const num = xArr
      .map((xi, i) => (xi - xMean) * (yArr[i] - yMean))
      .reduce((a, b) => a + b, 0);
    const den = xArr
      .map((xi) => Math.pow(xi - xMean, 2))
      .reduce((a, b) => a + b, 0);

    const a = num / den;
    const b = yMean - a * xMean;

    return xArr.map((xi) => a * xi + b);
  };

  const traces: Data[] = [];

  columns.forEach(() => {
    const y = signals ?? [];

    // Asl signal
    traces.push({
      x,
      y,
      type: "scatter",
      mode: "lines+markers",
      name: "Charchoq",
    });

    // Regressiya chizig‘i
    const yPred = computeRegression(x, y);
    traces.push({
      x,
      y: yPred,
      type: "scatter",
      mode: "lines",
      name: `Regressiya`,
      line: { color: "red", dash: "dot" },
    });
  });

  const clonseHandle = () => {
    setSelectedMuscle(undefined);
    onClose();
  };
  useEffect(() => {
    if (open && selectedMuscle) refetch();
  }, [open, refetch, selectedMuscle]);

  return (
    <Dialog open={open} onClose={clonseHandle} maxWidth="lg" fullWidth>
      <DialogTitle>Muskul charchoq qiymatlari grafigi</DialogTitle>
      <DialogContent>
        <Stack my={2} direction={"row"} spacing={1}>
          <Autocomplete
            sx={{ flex: 1 }}
            onChange={(_event: any, newValue: string | null) => {
              setSelectedMuscle(newValue as any);
              console.log(newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Muskul turi" />
            )}
            options={
              muscles?.map((option) => ({
                label: `${option.title} - ${option.shortname}`,
                id: option.id,
                name: option.name,
                shortname: option.shortname,
                title: option.title,
              })) || ([] as any)
            }
          ></Autocomplete>
          <IconButton onClick={() => refetchMuscles()} disabled={isFetching}>
            <SyncIcon />
          </IconButton>
        </Stack>
        {isLoading ? (
          <Box
            sx={{
              p: 2,
              gap: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
            <Typography>Yuklanmoqda...</Typography>
          </Box>
        ) : selectedMuscle ? (
          <Box width={"100%"} overflow={"auto"}>
            <Plot
              data={traces}
              layout={layout}
              config={{
                responsive: true,
                displaylogo: false,
              }}
              style={{ width: "100%", minWidth: 500 }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              gap: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography>Ma'lumot yo'q</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={clonseHandle} color="primary">
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};
