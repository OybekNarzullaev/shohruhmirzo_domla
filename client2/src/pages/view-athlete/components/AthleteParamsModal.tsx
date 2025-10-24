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
import { AthleteParams } from "../../../types/Athlete";

interface Props {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: AthleteParams) => void;
  athleteParams?: AthleteParams; // select uchun sportchilar ro'yxati
}

export const AthleteParamsModal: React.FC<Props> = ({
  open,
  isLoading,
  onClose,
  onSubmit,
  athleteParams,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AthleteParams>({
    defaultValues: {
      athlete: null as any,
      bmi: 0,
      weight: 0,
      height: 0,
      description: "",
    },
  });

  const handleFormSubmit = (data: AthleteParams) => {
    onSubmit(data);
    reset();
    onClose();
  };

  useEffect(() => {
    if (athleteParams)
      for (const [key, value] of Object.entries(athleteParams)) {
        setValue(key as any, value as any);
      }
    else {
      reset();
    }
  }, [athleteParams]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {athleteParams ? "Parametrni tahrirlash" : "Yangi parametr qo‘shish"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Weight */}
            <Controller
              name="weight"
              control={control}
              rules={{
                required: "Vazn kiritilishi kerak",
                min: { value: 1, message: "Vazn 1 dan katta bo‘lishi kerak" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Vazn (kg)"
                  fullWidth
                  error={!!errors.weight}
                  helperText={errors.weight?.message}
                />
              )}
            />

            {/* Height */}
            <Controller
              name="height"
              control={control}
              rules={{
                required: "Bo‘y kiritilishi kerak",
                min: { value: 30, message: "Bo‘y juda kichik" },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Bo‘y (sm)"
                  fullWidth
                  error={!!errors.height}
                  helperText={errors.height?.message}
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
