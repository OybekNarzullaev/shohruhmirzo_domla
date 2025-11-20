import { useQuery } from "@tanstack/react-query";
import { fatigueByTrainingGraph } from "../../../api/athletes";
import { useParams } from "react-router";
import { listMusclesAPI } from "../../../api/muscle";
import { useEffect, useState } from "react";
import SyncIcon from "@mui/icons-material/Sync";
import type { Muscle } from "../../../types/Core";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Paper,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Layout } from "plotly.js";
import Plot from "react-plotly.js";

export const FatiguesByTrainingGraph = () => {
  const { id } = useParams<{ id: any }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [expanded, setExpanded] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle | null>(null);

  // === 1. Muskullar ro'yxati ===
  const {
    data: muscles = [],
    refetch: refetchMuscles,
    isFetching: isFetchingMuscles,
  } = useQuery({
    queryKey: ["muscles", id],
    queryFn: () => listMusclesAPI(undefined, id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // === 2. K-Load grafigi ===
  const {
    data: graphData = {},
    refetch,
    isLoading: isLoadingGraph,
    isError,
  } = useQuery({
    queryKey: ["fatigue_avg", id, selectedMuscle?.shortname],
    queryFn: () => fatigueByTrainingGraph(id, selectedMuscle!.shortname),
    enabled: !!selectedMuscle && !!id,
    refetchOnWindowFocus: false,
  });

  // === 3. Grafik ma'lumotlari ===

  const { signals = {}, columns = [] } = graphData as any;

  const traces = columns.map((col: any) => ({
    x: signals["titles"],
    y: signals[col] || [],
    type: "bar",
    mode: "lines+markers",
    name: col,
    marker: { size: 7 },
    line: { width: 2.5 },
    hovertemplate: "<b>%{x}</b>. mashq<br><b>%{y:.2f}</b><extra></extra>",
  }));

  // === 4. Layout (Dark Mode mos) ===
  const layout: Partial<Layout> = {
    title: {
      text: selectedMuscle
        ? `${selectedMuscle.title} – o'rtacha charchoq qiymatlari`
        : "O'rtacha charchoq grafigi",
      font: { size: 18, color: isDark ? "#fff" : "#000" },
    },
    xaxis: {
      title: { text: "Mashg'ulotlar", font: { size: 14 } },
      tickmode: "linear",
      dtick: 1,
      gridcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    yaxis: {
      title: { text: "o'rtacha charchoq qiymati", font: { size: 14 } },
      gridcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    hovermode: "x unified",
    autosize: true,
    height: 520,
    margin: { t: 80, b: 70, l: 70, r: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    legend: {
      bgcolor: isDark ? "rgba(30,30,30,0.9)" : "rgba(255,255,255,0.9)",
      bordercolor: isDark ? "#555" : "#ddd",
      borderwidth: 1,
      font: { color: isDark ? "#fff" : "#000" },
    },
  };

  // === 5. Muskul tanlanganda avto-refetch ===
  useEffect(() => {
    if (selectedMuscle && id) {
      refetch();
    }
  }, [selectedMuscle, id, refetch]);

  // === 6. Ranglar (Dark Mode) ===
  const bgColor = isDark ? "grey.900" : "background.paper";
  const borderColor = isDark ? "grey.700" : "grey.300";

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      sx={{
        borderRadius: 2,
        bgcolor: bgColor,
        boxShadow: isDark ? 4 : 3,
        border: `1px solid ${borderColor}`,
        "&:before": { display: "none" },
        transition: "all 0.3s ease",
      }}
    >
      {/* Sarlavha */}
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "background.default" }} />}
        sx={{
          bgcolor: "primary.main",
          color: "background.default",
          borderRadius: expanded ? "8px 8px 0 0" : 2,
          minHeight: 56,
          "& .MuiAccordionSummary-content": { alignItems: "center" },
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <Typography variant="h6" fontWeight="medium">
          O'rtacha charchoq grafigi
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* Muskul tanlash */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              color: "background.default",
              borderRadius: 2,
            }}
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
              <Skeleton variant="rectangular" width="100%" height={400} />
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
                Ma'lumotlarni yuklab bo‘lmadi. Qayta urining.
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
          ) : traces.length === 0 ? (
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
      </AccordionDetails>
    </Accordion>
  );
};
