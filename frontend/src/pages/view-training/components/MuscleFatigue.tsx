import { useQuery } from "@tanstack/react-query";
import { muscleFatigueGraphAPI } from "@/api/training";

import { useEffect, useState } from "react";
import SyncIcon from "@mui/icons-material/Sync";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  Paper,
  useTheme,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Layout, Data } from "plotly.js";
import Plot from "react-plotly.js";
import { useParams } from "react-router";
import { useMuscles } from "@/store/muscle";
import { formatMuscleTitle } from "@/utils/funtions";

export const MuscleFatigue = () => {
  const theme = useTheme();
  const training_id = useParams().trainingId as string;
  const isDark = theme.palette.mode === "dark";

  const { muscles } = useMuscles();
  const [expanded, setExpanded] = useState(true);
  const [visibleMuscles, setVisibleMuscles] = useState<Set<string>>(new Set());
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const {
    data: graphData = {},
    refetch: refetchGraph,
    isLoading: isLoadingGraph,
    isError,
  } = useQuery({
    queryKey: ["muscle-fatigue-by-training", training_id],
    queryFn: () => muscleFatigueGraphAPI(training_id),
    enabled: !!training_id,
    refetchOnWindowFocus: false,
  });

  const { signals = {}, columns = [], rows_count = 0 } = graphData as any;
  const x = Array.from({ length: rows_count }, (_, i) => i + 1);

  useEffect(() => {
    if (columns.length > 0) {
      setVisibleMuscles(new Set(columns));
    }
  }, [columns]);

  const traces: Data[] = columns
    .filter((col: string) => visibleMuscles.has(col))
    .map((col: string) => {
      const base = {
        x,
        y: signals[col] || [],
        name: col,
        hovertemplate: `<b>${col}</b><br><b>%{x}</b>. mashq<br>Charchoq: <b>%{y:.2f}</b><extra></extra>`,
      };

      if (chartType === "line") {
        return {
          ...base,
          type: "scatter" as const,
          mode: "lines+markers" as const,
          marker: { size: 9 },
          line: { width: 3.5 },
        };
      } else {
        return {
          ...base,
          type: "bar" as const,
          marker: { line: { width: 1.5, color: isDark ? "#444" : "#ddd" } },
        };
      }
    });

  const colors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
    "#aec7e8",
    "#ffbb78",
    "#98df8a",
    "#ff9896",
    "#c5b0d5",
    "#ffb3e6",
    "#c4e6ff",
    "#ff9f9b",
    "#a1e9a1",
  ];

  traces.forEach((trace: any, i: number) => {
    const color = colors[i % colors.length];
    if (chartType === "line") {
      trace.line = { ...trace.line, color };
      trace.marker = { ...trace.marker, color };
    } else {
      trace.marker = { ...trace.marker, color };
    }
  });

  // === ENG MUHIM O'ZGARTIRISH: tickmode: "auto" + rangeslider ===
  const layout: Partial<Layout> = {
    title: {
      text: "Muskullar boʻyicha charchoq dinamikasi (bitta mashgʻulot ichida)",
      font: { size: 18, color: isDark ? "#fff" : "#000" },
    },
    xaxis: {
      title: { text: "Mashqlar ketma-ketligi", font: { size: 14 } },
      tickmode: "auto", // ← Bu eng muhimi! Zoom qilganda avto-o'zgaradi
      nticks: rows_count > 50 ? 15 : undefined, // Faqat katta bo'lsa cheklaymiz
      tick0: 1,
      tickformat: "d",
      automargin: true,
      showgrid: true,
      gridcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      zeroline: false,
      fixedrange: false,

      // Qo'shimcha: pastda kichik slider (ixtiyoriy, juda qulay)
      rangeslider: {
        visible: true,
        thickness: 0.05,
        bgcolor: isDark ? "#333" : "#f0f0f0",
      },
      rangeselector: {
        buttons: [
          { count: 10, label: "10 ta", step: "all" },
          { count: 20, label: "20 ta", step: "all" },
          { step: "all", label: "Hammasi" },
        ],
        bgcolor: isDark ? "#444" : "#eee",
        activecolor: theme.palette.primary.main,
      },
    },
    yaxis: {
      title: { text: "Charchoq darajasi", font: { size: 14 } },
      gridcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      zeroline: false,
      automargin: true,
      fixedrange: false,
    },
    hovermode: "x unified",
    barmode: chartType === "bar" ? "group" : undefined,
    height: 620, // slider joylashishi uchun biroz balandlik qo'shdik
    margin: { t: 90, b: 120, l: 80, r: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    showlegend: true,
    legend: {
      title: { text: "Muskullar", font: { size: 14 } },
      bgcolor: isDark ? "rgba(30,30,30,0.9)" : "rgba(255,255,255,0.9)",
      bordercolor: isDark ? "#555" : "#ddd",
      borderwidth: 1,
      font: { color: isDark ? "#fff" : "#000" },
    },
  };

  const toggleMuscle = (shortname: string) => {
    setVisibleMuscles((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(shortname) ? next.delete(shortname) : next.add(shortname);
      return next;
    });
  };

  const bgColor = isDark ? "grey.900" : "background.paper";
  const borderColor = isDark ? "grey.700" : "grey.300";

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, exp) => setExpanded(exp)}
      sx={{
        borderRadius: 2,
        bgcolor: bgColor,
        boxShadow: isDark ? 4 : 3,
        border: `1px solid ${borderColor}`,
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "background.default" }} />}
        sx={{
          bgcolor: "primary.main",
          color: "background.default",
          borderRadius: expanded ? "8px 8px 0 0" : 2,
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        <Typography variant="h6" fontWeight="medium">
          Muskullar boʻyicha charchoq dinamikasi
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Koʻrsatiladigan muskullar:
              </Typography>

              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Grafik turi</InputLabel>
                  <Select
                    value={chartType}
                    label="Grafik turi"
                    onChange={(e) =>
                      setChartType(e.target.value as "line" | "bar")
                    }
                  >
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="bar">Bar Chart</MenuItem>
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => refetchGraph()}
                  disabled={isLoadingGraph}
                  color="primary"
                >
                  <SyncIcon
                    sx={{
                      animation: isLoadingGraph
                        ? "spin 1s linear infinite"
                        : "none",
                    }}
                  />
                </IconButton>
              </Stack>
            </Stack>

            <FormGroup row sx={{ mt: 2, flexWrap: "wrap", gap: 1.5 }}>
              {columns.map((shortname: string) => (
                <FormControlLabel
                  key={shortname}
                  control={
                    <Checkbox
                      checked={visibleMuscles.has(shortname)}
                      onChange={() => toggleMuscle(shortname)}
                      size="small"
                    />
                  }
                  label={
                    formatMuscleTitle(
                      muscles.find((m) => m.shortname === shortname)
                    ) ?? shortname
                  }
                  sx={{ m: 0 }}
                />
              ))}
            </FormGroup>
          </Paper>

          {/* Grafik */}
          {isLoadingGraph ? (
            <Box
              sx={{
                minHeight: 550,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Skeleton variant="rectangular" width="100%" height={550} />
              <Typography color="text.secondary" mt={2}>
                Grafik yuklanmoqda...
              </Typography>
            </Box>
          ) : isError ? (
            <Box
              sx={{
                minHeight: 550,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "error.main",
              }}
            >
              <Typography variant="h6">Ma'lumot yuklashda xatolik</Typography>
            </Box>
          ) : columns.length === 0 ? (
            <Box
              sx={{
                minHeight: 550,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Hozircha charchoq ma'lumoti yoʻq
              </Typography>
            </Box>
          ) : traces.length === 0 ? (
            <Box
              sx={{
                minHeight: 550,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Hech qanday muskul tanlanmagan
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
                  modeBarButtonsToRemove: ["lasso2d", "select2d"],
                }}
                style={{ width: "100%", minWidth: 700, height: 620 }}
              />
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
