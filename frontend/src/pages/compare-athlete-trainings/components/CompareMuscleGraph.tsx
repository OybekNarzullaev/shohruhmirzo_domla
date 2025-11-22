// components/CompareMuscleGraph.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Plot from "react-plotly.js";
import { compareTrainingsByMuscleAPI } from "@/api/athletes";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Stack,
  CircularProgress,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { useMuscles } from "@/store/muscle";

interface TrainingComparisonGraphProps {
  athleteId: number | string;
  selectedTrainingIds: number[];
}

export const CompareMuscleGraph = ({
  athleteId,
  selectedTrainingIds,
}: TrainingComparisonGraphProps) => {
  const [expanded, setExpanded] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
  const { muscles } = useMuscles();

  // Faqat treninglar o'zgarganda ma'lumotni yuklaymiz (muskulni backendga yubormaymiz)
  const { data, isLoading, error } = useQuery({
    queryKey: ["compare-muscle-all", athleteId, selectedTrainingIds],
    queryFn: () => compareTrainingsByMuscleAPI(athleteId, selectedTrainingIds),
    enabled: selectedTrainingIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Birinchi marta ma'lumot kelganda — birinchi muskulni avtomatik tanlaymiz
  useEffect(() => {
    if (data?.columns && data.columns.length > 0 && !selectedMuscle) {
      setSelectedMuscle(data.columns[0]);
    }
  }, [data?.columns, selectedMuscle]);

  // Faqat tanlangan muskul uchun chiziqlar yaratamiz
  const traces =
    data?.signals && selectedMuscle && data.signals[selectedMuscle]
      ? Object.entries(data.signals[selectedMuscle]).map(
          ([trainingName, values]: any) => ({
            x: Array.from({ length: values.length }, (_, i) => i + 1),
            y: values,
            type: "scatter" as const,
            mode: "lines+markers" as const,
            name: trainingName,
            line: { width: 4 },
            marker: { size: 9 },
            hovertemplate: `
          <b>${selectedMuscle}</b><br>
          Mashq: %{x}<br>
          Charchoq: %{y:.1%}<br>
          <b>${trainingName}</b>
          <extra></extra>
        `.trim(),
          })
        )
      : [];

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, v) => setExpanded(v)}
      sx={{
        borderRadius: 3,
        boxShadow: 5,
        mb: 4,
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 32 }} />}
        sx={{
          bgcolor: "primary.dark",
          color: "Background",
          borderRadius: expanded ? "12px 12px 0 0" : 3,
          minHeight: 80,
          "& .MuiAccordionSummary-content": { alignItems: "center" },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={3} flex={1}>
          <CompareArrowsIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5">Mashg‘ulotlarni solishtirish</Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {selectedTrainingIds.length} ta trening •{" "}
              {selectedMuscle
                ? `Muskul: ${selectedMuscle}`
                : "Muskul tanlanmoqda..."}
            </Typography>
          </Box>
        </Stack>

        {data && selectedMuscle && (
          <Chip
            icon={<FitnessCenterIcon />}
            label={`${data.compared_count} trening • ${data.rows_count} mashq`}
            color="secondary"
            sx={{ fontWeight: "bold", px: 2, height: 44 }}
          />
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3 }}>
        {/* Loading */}
        {isLoading && (
          <Box textAlign="center" py={10}>
            <CircularProgress size={70} thickness={5} />
            <Typography mt={3} variant="h6">
              Mashg‘ulotlar yuklanmoqda...
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Ma'lumotlar yuklanmadi. Internetni tekshiring.
          </Alert>
        )}

        {/* Musul tanlash */}
        {data && data.columns?.length > 0 && (
          <Box sx={{ maxWidth: 500, mx: "auto", mb: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="muscle-select">Muskul tanlang</InputLabel>
              <Select
                labelId="muscle-select"
                value={selectedMuscle}
                label="Muskul tanlang"
                onChange={(e) => setSelectedMuscle(e.target.value as string)}
              >
                {data.columns.map((muscle: string) => (
                  <MenuItem key={muscle} value={muscle}>
                    {muscle} -{" "}
                    {muscles.find((m) => m.shortname === muscle)?.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Grafik faqat muskul tanlanganda chiqadi */}
        {selectedMuscle && traces.length > 0 && (
          <>
            <Typography variant="h6" align="center" gutterBottom>
              {selectedMuscle} -{" "}
              {muscles.find((m) => m.shortname === selectedMuscle)?.title}{" "}
              muskuli — barcha tanlangan mashg‘ulotlar bo‘yicha
            </Typography>

            <Box sx={{ mt: 3, width: "100%", overflowX: "auto" }}>
              <Plot
                data={traces}
                layout={
                  {
                    xaxis: {
                      title: "Mashq tartib raqami",
                      type: "linear",
                      tick0: 1,
                      tickmode: "auto", // Eng muhimi – "auto"!
                      nticks: 20, // Maksimal 20 ta belgi (zoom qilmaganda)
                      showgrid: true,
                      gridcolor: "rgba(0,0,0,0.08)",
                      zeroline: false,
                      fixedrange: false, // zoom/pan ruxsat
                      range: [0.5, (data?.rows_count || 100) + 0.5],
                      automargin: true,
                    },

                    legend: {
                      orientation: "h",
                      y: -0.3,
                      font: { size: 12 },
                    },
                    hovermode: "x unified",
                    height: 620,
                    margin: { t: 100, b: 140, l: 80, r: 60 },
                  } as any
                }
                config={{
                  responsive: true,
                  displayModeBar: true,
                  displaylogo: false,
                }}
                style={{ width: "100%", minWidth: 750 }}
              />
            </Box>

            {/* Treninglar ro‘yxati */}
            <Stack spacing={2} mt={4}>
              <Typography variant="subtitle1" fontWeight="medium">
                Solishtirilgan mashg‘ulotlar:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {data.training_info.map((t: any) => (
                  <Chip
                    key={t.id}
                    label={t.name}
                    color="info"
                    variant="outlined"
                    size="medium"
                  />
                ))}
              </Box>
            </Stack>
          </>
        )}

        {/* Musul hali tanlanmagan bo‘lsa */}
        {data && !selectedMuscle && (
          <Paper sx={{ p: 8, textAlign: "center", bgcolor: "grey.50" }}>
            <Typography variant="h6" color="text.secondary">
              Grafikni ko‘rish uchun yuqoridan bitta muskul tanlang
            </Typography>
          </Paper>
        )}

        {/* Hech qanday ma'lumot topilmadi */}
        {data && data.rows_count === 0 && (
          <Paper sx={{ p: 8, textAlign: "center", bgcolor: "warning.light" }}>
            <Typography variant="h6" color="text.secondary">
              Tanlangan treninglarda charchoq ma'lumotlari topilmadi
            </Typography>
          </Paper>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
