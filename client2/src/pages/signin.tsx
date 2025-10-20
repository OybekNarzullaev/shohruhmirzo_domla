"use client";
import LinearProgress from "@mui/material/LinearProgress";
import { SignInPage } from "@toolpad/core/SignInPage";
import { Navigate, useNavigate } from "react-router";
import { getProfileAPI, loginAPI } from "../api/auth";
import { Session, useSessionStore } from "../store/auth";
import { Backdrop, CircularProgress } from "@mui/material";

export default function SignIn() {
  const navigate = useNavigate();
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
      return { error: message };
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <SignInPage
        localeText={{
          // Bu faqat foydalanuvchi ko'radigan yorliqni (label) o'zgartiradi
          email: "Foydalanuvchi nomi",
          password: "Parol",
          signInTitle: "Shohruhmirzo Xoldorov",
          signInSubtitle: "Xush kelibsiz hurmatli foydalanuvchi!",
          // 'to' yozuvi qanday matnga mos kelayotganini aniqlash kerak, odatda bu kerak emas.
        }}
        slotProps={{
          emailField: { autoFocus: false },
          form: { noValidate: true },
        }}
        providers={[{ id: "credentials", name: "Credentials" }]}
        signIn={handleSignIn}
      ></SignInPage>
    </>
  );
}
