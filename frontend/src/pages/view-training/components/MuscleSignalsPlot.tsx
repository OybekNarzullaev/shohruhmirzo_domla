import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Plot from "react-plotly.js";
import { useParams } from "react-router";
import SaveIcon from "@mui/icons-material/Save";
import { emtDataTrainingSesssionAPI } from "../../../api/training";
import { createExerciseAPI } from "../../../api/exercise";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useForm, Controller, useWatch } from "react-hook-form";
import type { Layout } from "plotly.js";

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface FormValues {
  start: number;
  end: number;
  description: string;
}

export default function MuscleSignalsPlot() {
  const { trainingId } = useParams<{ trainingId: string }>();
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  // === 1. Form setup ===
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      start: 0,
      end: 0,
      description: "",
    },
  });

  const watchedStart = useWatch({ control, name: "start" });
  const watchedEnd = useWatch({ control, name: "end" });
  const isRangeSelected =
    watchedStart !== watchedEnd &&
    watchedStart >= 0 &&
    watchedEnd > watchedStart;

  // === 2. EMG ma'lumotlari ===
  const { data: emtData, isLoading } = useQuery({
    queryKey: [trainingId, "emt-data-training"],
    queryFn: () => emtDataTrainingSesssionAPI(trainingId!),
    enabled: !!trainingId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // === 3. Chiziqlarning ko'rinish holati (checkbox) ===
  const [visibleTraces, setVisibleTraces] = useState<boolean[]>([]);

  // Birinchi yuklanishda visibleTraces ni to'ldirish
  useEffect(() => {
    if (emtData && visibleTraces.length === 0) {
      setVisibleTraces(new Array(emtData.columns.length).fill(true));
    }
  }, [emtData, visibleTraces.length]);

  // === 4. Checkbox o'zgarishi ===
  const handleCheckboxChange = (index: number) => {
    setVisibleTraces((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  // === 5. Mashq yaratish ===
  const { mutateAsync: createExercise, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      createExerciseAPI({
        signal_length: data.end - data.start,
        first_count: data.start,
        last_count: data.end,
        training: parseInt(trainingId!),
        description: data.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [trainingId, "get-training-exercises"],
      });
      notifications.show("Mashq muvaffaqiyatli yaratildi!", {
        severity: "success",
        autoHideDuration: 3000,
      });
      setValue("start", 0);
      setValue("end", 0);
      setValue("description", "");
    },
    onError: () => {
      notifications.show("Xatolik yuz berdi. Qayta urining.", {
        severity: "error",
      });
    },
  });

  // === 6. Layout ===
  const [layout, setLayout] = useState<Partial<Layout>>({
    title: { text: "Mushak signallari grafigi" },
    xaxis: {
      title: { text: "Vaqt (s)" },
      rangeslider: { visible: true },
    },
    yaxis: { title: { text: "Qiymat" } },
    autosize: true,
    height: 500,
    margin: { t: 60, b: 60, l: 60, r: 40 },
  });

  // === 7. Relayout (zoom, pan, rangeslider) ===
  const handleRelayout = (event: any) => {
    let start: number | undefined;
    let end: number | undefined;

    if (
      event["xaxis.range[0]"] !== undefined &&
      event["xaxis.range[1]"] !== undefined
    ) {
      start = Math.round(Number(event["xaxis.range[0]"]));
      end = Math.round(Number(event["xaxis.range[1]"]));
    } else if (Array.isArray(event["xaxis.range"])) {
      [start, end] = event["xaxis.range"].map((v: any) =>
        Math.round(Number(v))
      );
    } else if (event["xaxis.autorange"]) {
      start = 0;
      end = 0;
    }

    if (start !== undefined && end !== undefined) {
      setValue("start", start);
      setValue("end", end);
      setLayout((prev) => ({
        ...prev,
        xaxis: { ...prev.xaxis, range: [start, end] },
      }));
    }
  };

  // === 8. Submit ===
  const onSubmit = async (data: FormValues) => {
    if (!isRangeSelected) {
      notifications.show("Iltimos, grafikdan diapazonni belgilang!", {
        severity: "warning",
      });
      return;
    }
    await createExercise(data);
  };

  // === 9. Loading ===
  if (isLoading || !emtData || visibleTraces.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Ma'lumotlar yuklanmoqda...</Typography>
      </Paper>
    );
  }

  const { signals, columns, rows_count } = emtData;
  const x = Array.from({ length: rows_count }, (_, i) => i);

  // === 10. Faqat ko'rinadigan chiziqlarni yaratish ===
  const traces = columns
    .map((col: any, index: number) => {
      if (!visibleTraces[index]) return null;

      return {
        x,
        y: signals[col],
        type: "scatter" as const,
        mode: "lines" as const,
        name: col,
        line: { width: 1.8 },
        hovertemplate: "%{y:.2f}<extra></extra>",
      };
    })
    .filter(Boolean);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, boxShadow: 3 }}>
      {/* Checkbox paneli */}
      <Box sx={{ mb: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
          Ko‘rinadigan signallar
        </Typography>
        <FormGroup row sx={{ flexWrap: "wrap", gap: 1 }}>
          {columns.map((col: string, index: number) => (
            <FormControlLabel
              key={col}
              control={
                <Checkbox
                  checked={visibleTraces[index] ?? true}
                  onChange={() => handleCheckboxChange(index)}
                  size="small"
                  sx={{ py: 0 }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                  {col}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Grafik */}
      <Box sx={{ width: "100%", overflowX: "auto", mb: 3 }}>
        <Plot
          data={traces as any}
          layout={layout}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ["toImage", "lasso2d", "select2d"],
          }}
          style={{ width: "100%", minWidth: 600, height: 500 }}
          onRelayout={handleRelayout}
        />
      </Box>

      {/* Forma */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Mashqni ajratib olish
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
          >
            <Controller
              name="start"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Boshi"
                  size="small"
                  type="number"
                  inputProps={{ readOnly: true }}
                  sx={{ width: { xs: "100%", md: 120 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">s</InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="end"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Oxiri"
                  size="small"
                  type="number"
                  inputProps={{ readOnly: true }}
                  sx={{ width: { xs: "100%", md: 120 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">s</InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              rules={{ required: "Tavsif kiritish shart" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Tavsif"
                  size="small"
                  placeholder="Masalan: Oyoq ko'tarish"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{ flex: 1, minWidth: 200 }}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              disabled={!isRangeSelected || isPending || isSubmitting}
              sx={{ minWidth: 140, height: 40 }}
            >
              {isPending || isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </Stack>
        </form>

        <Typography variant="body2" color="text.secondary" mt={2}>
          Diapazonni grafikdan belgilang → tavsif kiriting → "Saqlash" tugmasini
          bosing.
        </Typography>

        {isRangeSelected && (
          <Typography
            variant="caption"
            color="success.main"
            mt={1}
            fontWeight="medium"
          >
            Tanlangan: {watchedStart}s — {watchedEnd}s (
            {watchedEnd - watchedStart} sekund)
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
