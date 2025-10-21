"use client";
import { SignInPage } from "@toolpad/core/SignInPage";
import { Navigate, useNavigate } from "react-router";
import { getProfileAPI, loginAPI } from "../api/auth";
import { Session, useSessionStore } from "../store/auth";
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import { useNotifications } from "@toolpad/core/useNotifications";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React from "react";
import { ThemeSwitcher } from "@toolpad/core/DashboardLayout";

function CustomEmailField() {
  return (
    <TextField
      id="input-with-icon-textfield"
      label="Email"
      name="email"
      type="email"
      size="small"
      required
      fullWidth
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircle fontSize="inherit" />
            </InputAdornment>
          ),
        },
      }}
      variant="outlined"
    />
  );
}

function CustomPasswordField() {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <FormControl sx={{ my: 2 }} fullWidth variant="outlined">
      <InputLabel size="small" htmlFor="outlined-adornment-password">
        Parol
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? "text" : "password"}
        name="password"
        size="small"
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              size="small"
            >
              {showPassword ? (
                <VisibilityOff fontSize="inherit" />
              ) : (
                <Visibility fontSize="inherit" />
              )}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  );
}

function CustomButton() {
  return (
    <Button
      startIcon={<LoginIcon />}
      type="submit"
      variant="contained"
      color="info"
      disableElevation
      fullWidth
      sx={{ my: 2 }}
    >
      Tizimga kirish
    </Button>
  );
}

function Title() {
  return (
    <Stack
      justifyContent={"space-between"}
      alignItems={"center"}
      width={"100%"}
    >
      <Box component={"img"} sx={{ width: 160 }} src="/logo.png" />
      <Typography
        variant="body1"
        color="primary.main"
        fontWeight={600}
        style={{ marginBottom: 8, textAlign: "center" }}
      >
        Sportchilarning biosignallarini tahlil qilish tizimi
      </Typography>
    </Stack>
  );
}

function CustomSubtitle() {
  return (
    <Stack
      direction={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
      width={"100%"}
    >
      <Typography variant="subtitle2">
        Xush kelibsiz hurmatli foydalanuvchi!
      </Typography>
      <ThemeSwitcher />
    </Stack>
  );
}
export default function SignIn() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const { setSession, setLoading, setError, setToken, session, loading } =
    useSessionStore();

  const handleSignIn = async (
    provider: any,
    formData: FormData,
    callbackUrl?: string
  ) => {
    let result;
    try {
      if (provider.id === "credentials") {
        // MUHIM: SignInPage ichki qismi maydonni hali ham "email" kaliti bilan jo'natadi.
        // Shuning uchun biz uni "email" kaliti orqali qabul qilib olamiz,
        // lekin uni "username" sifatida ishlatamiz.
        const username = formData?.get("email") as string;
        const password = formData?.get("password") as string;

        if (!username || !password) {
          return { error: "Foydalanuvchi nomi va parol majburiy" };
        }

        setLoading(true);
        // Sizning `loginAPI` funksiyangiz shu username/password juftligini
        // backendga yuboradi.
        result = await loginAPI(username, password);
      }

      if (result?.data?.token) {
        setToken(result.data.token);
        const { data: profile } = await getProfileAPI();
        const userSession: Session = {
          user: profile,
        };
        setSession(userSession);
        notifications.show("Tizimga xush kelibsiz!", {
          autoHideDuration: 3000,
          severity: "success",
        });
        navigate(callbackUrl || "/", { replace: true });
        return {};
      }

      // Agar server xato bermasa, lekin token ham qaytmasa (kamdan-kam holat)
      setError("Kirish muvaffaqiyatsiz bo‘ldi");
      return { error: "Kirish muvaffaqiyatsiz bo‘ldi" };
    } catch (err: any) {
      // Serverdan kelgan xatolarni ko‘rsatish
      const message = err?.response?.data?.detail || "Server xatosi";
      setError(message);
      notifications.show(message, {
        autoHideDuration: 3000,
        severity: "success",
      });
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  if (session && !loading) {
    return <Navigate to={"/"} />;
  }

  return (
    <SignInPage
      localeText={{
        signInSubtitle: "Xush kelibsiz hurmatli foydalanuvchi!",
      }}
      slots={{
        title: Title,
        emailField: CustomEmailField,
        passwordField: CustomPasswordField,
        submitButton: CustomButton,
        subtitle: CustomSubtitle,
      }}
      slotProps={{
        emailField: { autoFocus: true },
        form: { noValidate: true },
      }}
      providers={[{ id: "credentials", name: "Credentials" }]}
      signIn={handleSignIn}
    ></SignInPage>
  );
}
