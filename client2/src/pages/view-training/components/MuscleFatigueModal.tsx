import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
  Autocomplete,
  TextField,
  IconButton,
  Stack,
  Paper,
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

export const MuscleFatigueModal = ({
  open = false,
  training_id,
  onClose,
}: Props) => {
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle | null>(null);

  // === 1. Muskullar ro'yxati ===
  const {
    data: muscles = [],
    refetch: refetchMuscles,
    isFetching: isFetchingMuscles,
  } = useQuery({
    queryKey: ["muscles", training_id],
    queryFn: () => listMusclesAPI(training_id),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // === 2. Charchoq grafigi ===
  const {
    data: graphData = {},
    refetch,
    isLoading: isLoadingGraph,
    isError,
  } = useQuery({
    queryKey: ["muscle-fatigue", training_id, selectedMuscle?.shortname],
    queryFn: () =>
      muscleFatigueGraphAPI(training_id, selectedMuscle!.shortname),
    enabled: !!selectedMuscle && open,
    refetchOnWindowFocus: false,
  });

  // === 3. Grafik ma'lumotlari ===
  const { signals = {}, columns = [], rows_count = 0 } = graphData as any;
  const x = Array.from({ length: rows_count }, (_, i) => i + 1); // 1 dan boshlash

  const traces: Data[] = columns.map((col: string) => ({
    x,
    y: signals[col] || [],
    type: "scatter",
    mode: "lines+markers",
    name: col,
    marker: { size: 6 },
    line: { width: 2 },
    hovertemplate:
      "<b>%{x}</b>. mashq<br>Charchoq: <b>%{y:.2f}</b><extra></extra>",
  }));

  // === 4. Layout ===
  const layout: Partial<Layout> = {
    title: {
      text: selectedMuscle
        ? `${selectedMuscle.title} – Charchoq grafigi`
        : "Muskul charchoq grafigi",
      font: { size: 18 },
    },
    xaxis: {
      title: { text: "Mashqlar ketma-ketligi" },
      tickmode: "linear",
      dtick: 1,
      gridcolor: "rgba(0,0,0,0.1)",
    },
    yaxis: {
      title: { text: "Charchoq darajasi" },
      gridcolor: "rgba(0,0,0,0.1)",
    },
    hovermode: "x unified",
    autosize: true,
    height: 520,
    margin: { t: 80, b: 60, l: 70, r: 40 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    legend: {
      bgcolor: "rgba(255,255,255,0.9)",
      bordercolor: "#ddd",
      borderwidth: 1,
      x: 1,
      xanchor: "right",
      y: 1,
      yanchor: "top",
    },
  };

  // === 5. Yopish va tozalash ===
  const handleClose = () => {
    setSelectedMuscle(null);
    onClose();
  };

  // === 6. Muskul tanlanganda avto-refetch ===
  useEffect(() => {
    if (selectedMuscle && open) {
      refetch();
    }
  }, [selectedMuscle, open, refetch]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        Muskul charchoq qiymatlari grafigi
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Muskul tanlash */}
          <Paper
            elevation={0}
            sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Autocomplete
                fullWidth
                value={selectedMuscle}
                onChange={(_e, value) => setSelectedMuscle(value)}
                options={muscles}
                getOptionLabel={(option) =>
                  `${option.title} (${option.shortname})`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Muskul tanlang"
                    placeholder="Misol: RF, VL, BF..."
                    size="small"
                  />
                )}
                loading={isFetchingMuscles}
                loadingText="Yuklanmoqda..."
                noOptionsText="Muskullar topilmadi"
              />
              <IconButton
                onClick={() => refetchMuscles()}
                disabled={isFetchingMuscles}
                color="primary"
                title="Yangilash"
              >
                <SyncIcon
                  sx={{
                    animation: isFetchingMuscles
                      ? "spin 1s linear infinite"
                      : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Stack>
          </Paper>

          {/* Grafik yoki holat */}
          {isLoadingGraph ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
                gap: 2,
              }}
            >
              <CircularProgress size={48} />
              <Typography color="text.secondary">
                Grafik yuklanmoqda...
              </Typography>
            </Box>
          ) : isError ? (
            <Box
              sx={{
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "error.main",
              }}
            >
              <Typography variant="h6">Xatolik yuz berdi</Typography>
              <Typography variant="body2">
                Ma'lumotlarni yuklab bo'lmadi. Qayta urining.
              </Typography>
            </Box>
          ) : !selectedMuscle ? (
            <Box
              sx={{
                minHeight: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">
                Muskul tanlang, grafikni ko‘rish uchun
              </Typography>
            </Box>
          ) : rows_count === 0 ? (
            <Box
              sx={{
                minHeight: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">
                Ushbu mushak uchun ma'lumot yo'q
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Plot
                data={traces}
                layout={layout}
                config={{
                  responsive: true,
                  displaylogo: false,
                  modeBarButtonsToRemove: ["toImage", "lasso2d", "select2d"],
                }}
                style={{ width: "100%", minWidth: 600 }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="medium">
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};
