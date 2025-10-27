import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Plot from "react-plotly.js";
import { useParams } from "react-router";
import SaveIcon from "@mui/icons-material/Save";
import { emtDataTrainingSesssionAPI } from "../../../api/training";
import type { Layout } from "plotly.js";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { createExerciseAPI } from "../../../api/exercise";
import { useForm, Controller } from "react-hook-form";
import { useNotifications } from "@toolpad/core/useNotifications";

export default function MuscleSignalsPlot() {
  const trainingId = useParams().trainingId as string;
  const [range, setRange] = useState<{ start: number; end: number } | null>(
    null
  );

  const queryClient = useQueryClient();

  const notifications = useNotifications();
  const [layout, setLayout] = useState<Partial<Layout>>({
    title: { text: "Mushak signallari grafigi" },
    xaxis: { title: { text: "Vaqt (s)" }, rangeslider: { visible: true } },
    yaxis: { title: { text: "Qiymat" } },
    autosize: true,
    height: 500,
  });

  // ✅ react-hook-form setup
  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      start: 0,
      end: 0,
      description: "",
    },
  });

  // 🔹 EMG ma’lumotlar
  const { data: emtData, isLoading } = useQuery({
    queryKey: [trainingId, "emt-data-training"],
    queryFn: () => emtDataTrainingSesssionAPI(trainingId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // 🔹 Mashq yaratish mutatsiyasi
  const { mutateAsync: createExercise, isPending } = useMutation({
    mutationFn: (payload: {
      start: number;
      end: number;
      description: string;
    }) =>
      createExerciseAPI({
        signal_length: payload.end - payload.start,
        first_count: payload.start,
        last_count: payload.end,
        training: parseInt(trainingId),
        description: payload.description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [trainingId, "get-training-exercises"],
      });
      // reset({ start: 0, end: 0, description: "" });
      // setRange(null);
      // setLayout((prev) => ({
      //   ...prev,
      //   xaxis: { ...prev.xaxis, range: undefined },
      // }));
      notifications.show("Yaratildi!", {
        autoHideDuration: 3000,
        severity: "success",
      });
    },
  });

  // 🔥 range o‘zgarganda start va end ni yangilash
  useEffect(() => {
    if (range) {
      setValue("start", Math.round(range.start));
      setValue("end", Math.round(range.end));
    } else {
      setValue("start", 0);
      setValue("end", 0);
    }
  }, [range, setValue]);

  if (isLoading || !emtData)
    return (
      <Paper
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
      </Paper>
    );

  const { signals, columns, rows_count } = emtData;
  const x = Array.from({ length: rows_count }, (_, i) => i);

  const traces = columns.map((col: any) => ({
    x,
    y: signals[col],
    type: "scatter",
    mode: "lines",
    name: col,
  }));

  const handleRelayout = (eventData: any) => {
    // 1️⃣ Zoom yoki range o'zgarsa
    if (
      eventData["xaxis.range[0]"] !== undefined &&
      eventData["xaxis.range[1]"] !== undefined
    ) {
      const start = Number(eventData["xaxis.range[0]"]);
      const end = Number(eventData["xaxis.range[1]"]);
      if (!isNaN(start) && !isNaN(end)) {
        setRange({ start, end });
        // setLayout((prev) => ({
        //   ...prev,
        //   xaxis: { ...prev.xaxis, range: [start, end] },
        // }));
      }
    }

    // 2️⃣ Agar faqat `xaxis.range` bo‘lsa (ba’zida Plotly shunday uzatadi)
    else if (Array.isArray(eventData["xaxis.range"])) {
      const [start, end] = eventData["xaxis.range"].map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        setRange({ start, end });
        setLayout((prev) => ({
          ...prev,
          xaxis: { ...prev.xaxis, range: [start, end] },
        }));
      }
    }

    // 3️⃣ rangeslider reset yoki autoscale
    else if (eventData["xaxis.autorange"]) {
      setRange(null);
      setLayout((prev) => ({
        ...prev,
        xaxis: { ...prev.xaxis, range: undefined },
      }));
    }
  };

  // 🔹 Formani yuborish
  const onSubmit = async (values: any) => {
    if (!range) return;
    await createExercise(values);
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Box width={"100%"} overflow={"auto"}>
          <Plot
            data={traces as any}
            layout={layout}
            config={{
              responsive: true,
              displaylogo: false,
            }}
            style={{ width: "100%", minWidth: 500 }}
            onRelayout={handleRelayout}
          />
        </Box>

        <Box mt={3} color={"text.secondary"}>
          <Typography variant="h6" mb={1}>
            Mashqlarni ajratib olish
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack
              spacing={1.5}
              direction={{ md: "row", sm: "column", xs: "column" }}
              alignItems={{ xl: "center" }}
            >
              <Controller
                name="start"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    type="number"
                    slotProps={{
                      input: {
                        //   readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            Boshi:
                          </InputAdornment>
                        ),
                      },
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
                    size="small"
                    type="number"
                    slotProps={{
                      input: {
                        //   readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            Oxiri:
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Tasnif"
                    sx={{ flex: 1 }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Button
                type="submit"
                startIcon={<SaveIcon />}
                disabled={!range || isPending || isSubmitting}
                variant="contained"
              >
                {isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </Stack>
          </form>

          <Typography variant="subtitle2" mt={1}>
            Mashq yaratish uchun avval kerakli sohani grafikdan belgilang!
          </Typography>
        </Box>
      </Paper>
    </>
  );
}
