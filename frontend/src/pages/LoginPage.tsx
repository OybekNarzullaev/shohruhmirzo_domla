import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LoginIcon from "@mui/icons-material/Login";
import FormControl from "@mui/material/FormControl";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled, useTheme } from "@mui/material/styles";
import { Navigate } from "react-router";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import FormHelperText from "@mui/material/FormHelperText";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/auth";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function LoginPage() {
  const { login, isAuth, isLoading } = useAuthStore();
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const theme = useTheme();

  const onSubmit = async () => {
    const values = getValues();
    login(values.email, values.password);
  };

  if (isAuth) {
    return <Navigate to={"/"} />;
  }

  return (
    <SignInContainer direction="column" justifyContent="space-between">
      <Card variant="outlined">
        <Stack alignItems={"center"} gap={1}>
          <Box component={"img"} src="/logo.png" sx={{ width: 160 }} />
        </Stack>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          {/* ✅ EMAIL INPUT */}
          <FormControl variant="outlined">
            <InputLabel htmlFor="email" error={!!errors.email}>
              Email
            </InputLabel>
            <OutlinedInput
              id="email"
              type="text"
              label="Email"
              {...register("email", { required: "Email kiritilishi shart" })}
              error={!!errors.email}
            />
            {errors.email && (
              <FormHelperText sx={{ color: theme.palette.error.main }}>
                {errors.email.message}
              </FormHelperText>
            )}
          </FormControl>

          {/* ✅ PASSWORD INPUT */}
          <FormControl variant="outlined">
            <InputLabel htmlFor="password" error={!!errors.password}>
              Parol
            </InputLabel>
            <OutlinedInput
              id="password"
              type={showPassword ? "text" : "password"}
              label="Parol"
              {...register("password", {
                required: "Parol kiritilishi shart",
              })}
              error={!!errors.password}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "hide password" : "show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {errors.password && (
              <FormHelperText sx={{ color: theme.palette.error.main }}>
                {errors.password.message}
              </FormHelperText>
            )}
          </FormControl>

          {/* ✅ SUBMIT BUTTON */}
          <Button
            startIcon={<LoginIcon />}
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? "Yuklanmoqda..." : "Tizimga kirish"}
          </Button>
        </Box>
      </Card>
    </SignInContainer>
  );
}
