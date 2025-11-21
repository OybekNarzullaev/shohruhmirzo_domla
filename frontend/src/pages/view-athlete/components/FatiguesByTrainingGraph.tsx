import { useQuery } from "@tanstack/react-query";
import { fatigueByTrainingGraph } from "../../../api/athletes";
import { useParams } from "react-router";
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

export const FatiguesByTrainingGraph = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [expanded, setExpanded] = useState(true);
  const [visibleMuscles, setVisibleMuscles] = useState<Set<string>>(new Set());
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Bitta so'rov — barcha muskullar uchun o'rtacha charchoq
  const {
    data: graphData = {},
    refetch: refetchGraph,
    isLoading: isLoadingGraph,
    isError,
  } = useQuery({
    queryKey: ["fatigue-all", id],
    queryFn: () => fatigueByTrainingGraph(id as any), // endi muscle parametri yo'q!
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const { signals = {}, columns = [] } = graphData as any;

  // Yuklanganda barcha muskullarni avto-tanlash
  useEffect(() => {
    if (columns.length > 0) {
      setVisibleMuscles(new Set(columns));
    }
  }, [columns]);

  // Tracelarni yaratish
  const traces: Data[] = columns
    .filter((col: string) => visibleMuscles.has(col))
    .map((col: string) => {
      const base = {
        x: signals.titles || [],
        y: signals[col] || [],
        name: col, // legendada shortname chiqadi
        hovertemplate: `<b>${col}</b><br>%{x}<br><b>%{y:.2f}</b><extra></extra>`,
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

  // Rang palitrasi
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

  const layout: Partial<Layout> = {
    title: {
      text: "O'rtacha charchoq – Barcha muskullar",
      font: { size: 18, color: isDark ? "#fff" : "#000" },
    },
    xaxis: {
      title: { text: "Mashg‘ulotlar", font: { size: 14 } },
      tickmode: "array",
      tickvals: signals.titles?.map((_: any, i: number) => i),
      ticktext: signals.titles || [],
      gridcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    yaxis: {
      title: { text: "O'rtacha charchoq qiymati", font: { size: 14 } },
      gridcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    hovermode: "x unified",
    barmode: chartType === "bar" ? "group" : undefined,
    height: 580,
    margin: { t: 90, b: 80, l: 80, r: 50 },
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
          O'rtacha charchoq – Barcha muskullar
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* Nazorat paneli */}
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Ko‘rsatiladigan muskullar:
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
                  label={shortname}
                  sx={{ m: 0 }}
                />
              ))}
            </FormGroup>
          </Paper>

          {/* Grafik */}
          {isLoadingGraph ? (
            <Box
              sx={{
                minHeight: 500,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Skeleton variant="rectangular" width="100%" height={500} />
              <Typography color="text.secondary" mt={2}>
                Grafik yuklanmoqda...
              </Typography>
            </Box>
          ) : isError ? (
            <Box
              sx={{
                minHeight: 500,
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
                minHeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Hozircha charchoq ma'lumoti yo‘q
              </Typography>
            </Box>
          ) : traces.length === 0 ? (
            <Box
              sx={{
                minHeight: 500,
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
                style={{ width: "100%", minWidth: 700, height: 580 }}
              />
            </Box>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
