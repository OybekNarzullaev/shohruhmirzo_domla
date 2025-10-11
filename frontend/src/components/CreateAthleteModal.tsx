import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useForm, Controller } from "react-hook-form";
import { create } from "zustand";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Grid from "@mui/material/Grid";
import FormHelperText from "@mui/material/FormHelperText";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";

interface Store {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCreateAthleteModalStore = create<Store>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

interface FormValues {
  firstname: string;
  lastname: string;
  height: number | null;
  year_of_birth: number | null;
  weight: number | null;
  profile_pic: FileList | null;
}

export const CreateAthleteModal = () => {
  const theme = useTheme();
  const { isOpen, close } = useCreateAthleteModalStore();
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
    register,
  } = useForm<FormValues>({
    defaultValues: {
      firstname: "",
      lastname: "",
      height: null,
      year_of_birth: null,
      weight: null,
      profile_pic: null,
    },
  });

  const profile_pic = watch("profile_pic");
  const picture = profile_pic?.[0];

  const onSubmit = (data: FormValues) => {
    console.log("Yuborilgan ma’lumot:", data);
    reset();
    close();
  };

  useEffect(() => {
    return () => close();
  }, [close]);

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      fullWidth
      maxWidth="sm"
      aria-labelledby="create-athlete-dialog"
    >
      <DialogTitle id="create-athlete-dialog">Sportchi qo‘shish</DialogTitle>

      <DialogContent>
        <Stack p={2} alignItems={"center"}>
          <Avatar
            alt="ON"
            src={picture ? URL.createObjectURL(picture) : undefined}
            sx={{
              width: 96,
              height: 96,
              bgcolor: theme.palette.primary.main,
            }}
          />
        </Stack>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ mt: 1, mb: 2 }}
        >
          <Grid container spacing={2}>
            {/* Ism */}
            <Grid size={6}>
              <Controller
                name="firstname"
                control={control}
                rules={{ required: "Ism kiritish shart" }}
                render={({ field, fieldState }) => (
                  <TextField
                    size="small"
                    {...field}
                    label="Ism"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Familiya */}
            <Grid size={6}>
              <Controller
                name="lastname"
                control={control}
                rules={{ required: "Familiya kiritish shart" }}
                render={({ field, fieldState }) => (
                  <TextField
                    size="small"
                    {...field}
                    label="Familiya"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="year_of_birth"
                control={control}
                rules={{
                  required: "Tug‘ilgan yil shart",
                  min: {
                    value: 1900,
                    message: "1900 yildan katta bo‘lishi kerak",
                  },
                  max: {
                    value: new Date().getFullYear(),
                    message: "Kelajakdagi yil bo‘lishi mumkin emas",
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    size="small"
                    {...field}
                    type="number"
                    label="Tug‘ilgan yil"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="height"
                control={control}
                rules={{
                  required: "Bo‘y kiritish shart",
                  min: {
                    value: 50,
                    message: "Bo‘y 50 sm dan katta bo‘lishi kerak",
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    size="small"
                    {...field}
                    type="number"
                    label="Bo‘yi (sm)"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={6}>
              <Controller
                name="weight"
                control={control}
                rules={{
                  required: "Vazn kiritish shart",
                  min: {
                    value: 20,
                    message: "Vazn 20 kg dan katta bo‘lishi kerak",
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    size="small"
                    {...field}
                    type="number"
                    label="Vazn (kg)"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    fullWidth
                  />
                )}
              />
            </Grid>
            {/* Rasm yuklash */}
            <Grid size={6}>
              <Button
                variant="outlined"
                component="label"
                color={errors.profile_pic ? "error" : "primary"}
                startIcon={<CloudUploadIcon />}
                fullWidth
              >
                Rasm yuklash
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  {...register("profile_pic", {
                    required: "Profile rasmini yuklash shart",
                  })}
                />
              </Button>
              {errors.profile_pic && (
                <FormHelperText error>
                  {errors.profile_pic?.message}
                </FormHelperText>
              )}
            </Grid>
          </Grid>
          {/* Tugmalar */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            <Button
              type="button"
              onClick={() => {
                reset();
                close();
              }}
              startIcon={<CloseIcon />}
              variant="outlined"
            >
              Bekor qilish
            </Button>

            <Button type="submit" startIcon={<AddIcon />} variant="contained">
              Qo‘shish
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
