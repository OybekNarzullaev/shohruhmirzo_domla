"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { TrainingSession } from "../../../types/Core";
import { useQuery } from "@tanstack/react-query";
import { listSportTypesAPI } from "../../../api/sport-types";
import { FileUpload } from "../../../components/FileUpload";

interface Props {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: TrainingSession) => void;
  trainingSession?: TrainingSession; // select uchun sportchilar ro'yxati
}

export const TrainingSessionModal: React.FC<Props> = ({
  open,
  isLoading,
  onClose,
  onSubmit,
  trainingSession,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TrainingSession>({
    defaultValues: {
      id: undefined as any,
      title: "",
      athlete: null as any,
      sport_type: null as any,
      pre_heart_rate: null as any,
      post_heart_rate: null as any,
      exercise_count: null as any,
      duration: null as any,
      file_EMT: "",
      file_ECG: "",
      description: "",
    },
  });

  const { data: sportTypes, isLoading: isLoadingSportTypes } = useQuery({
    queryKey: ["sport_types"],
    queryFn: listSportTypesAPI,
    staleTime: Infinity,
  });

  const handleFormSubmit = (data: TrainingSession) => {
    onSubmit(data);
    reset();
    onClose();
  };

  useEffect(() => {
    if (trainingSession)
      for (const [key, value] of Object.entries(trainingSession)) {
        setValue(key as any, value as any);
      }
    else {
      reset();
    }
  }, [trainingSession]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {trainingSession
          ? "Mashg'ulotni tahrirlash"
          : "Yangi mashg'ulot qo‘shish"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={2} direction={{ xl: "row", lg: "row" }}>
            <Stack flex={1} spacing={2} sx={{ mt: 1 }}>
              {/* title */}
              <Controller
                name="title"
                control={control}
                rules={{
                  required: "Sport turi",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mashg'ulot sarlavhasi"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  ></TextField>
                )}
              />
              {/* sport types */}
              <Controller
                name="sport_type"
                control={control}
                rules={{
                  required: "Sport turi",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sport turi"
                    fullWidth
                    select
                    type="number"
                    error={!!errors.sport_type}
                    helperText={errors.sport_type?.message}
                  >
                    {sportTypes?.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              {/* pre */}
              <Controller
                name="pre_heart_rate"
                control={control}
                rules={{
                  required: "Dastlabki yurak urishini kiriting",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Dastlabki yurak urishi"
                    fullWidth
                    type="number"
                    error={!!errors.pre_heart_rate}
                    helperText={errors.pre_heart_rate?.message}
                  ></TextField>
                )}
              />
              {/* post */}
              <Controller
                name="post_heart_rate"
                control={control}
                rules={{
                  required: "Dastlabki yurak urishini kiriting",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Dastlabki yurak urishi"
                    fullWidth
                    type="number"
                    error={!!errors.post_heart_rate}
                    helperText={errors.post_heart_rate?.message}
                  ></TextField>
                )}
              />
              {/* Mashqlar soni */}
              <Controller
                name="exercise_count"
                control={control}
                rules={{
                  required: "Mashqlar sonini kiriting",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Masshqlar sonini kiriting"
                    fullWidth
                    type="number"
                    error={!!errors.exercise_count}
                    helperText={errors.exercise_count?.message}
                  ></TextField>
                )}
              />
            </Stack>
            <Stack flex={1} spacing={2} sx={{ mt: 1 }}>
              <Controller
                name="file_EMT"
                control={control}
                rules={{
                  required: "EMT faylini yuklang",
                }}
                render={({ field }) => (
                  <FileUpload
                    accept=".emt"
                    value={field.value as any}
                    onChange={field.onChange}
                    error={errors.file_EMT?.message as string}
                  />
                )}
              />
              {/* Description */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    rows={3}
                    label="Izoh (ixtiyoriy)"
                    fullWidth
                  />
                )}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Bekor qilish
          </Button>
          <Button
            disabled={isLoading}
            loading={isLoading}
            type="submit"
            variant="contained"
            color="primary"
          >
            Saqlash
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
