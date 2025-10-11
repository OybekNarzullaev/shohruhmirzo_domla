import React from "react";
import { AppThemeProvider } from "./providers/ThemeProvider";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { ToastProvider } from "./providers/ToastProvider";

const AppRouter = React.lazy(() => import("@/app/providers/RouterProvider"));
const App = () => {
  return (
    <AppThemeProvider>
      <ToastProvider />
      <React.Suspense
        fallback={
          <Stack
            height={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <CircularProgress size="3rem" />
          </Stack>
        }
      >
        <AppRouter />
      </React.Suspense>
    </AppThemeProvider>
  );
};

export default App;
