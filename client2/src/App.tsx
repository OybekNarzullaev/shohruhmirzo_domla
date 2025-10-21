import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import type { Navigation, Authentication } from "@toolpad/core/AppProvider";
import { useSessionStore } from "./store/auth";
import { logoutAPI } from "./api/auth";
import { useTheme, useMediaQuery } from "@mui/material";
import { NotificationsProvider } from "@toolpad/core/useNotifications";
import { Backdrop, CircularProgress } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Sahifalar",
  },
  {
    title: "Bosh sahifa",
    icon: <DashboardIcon />,
  },

  {
    segment: "athletes",
    title: "Sportchilar",
    icon: <PersonIcon />,
    pattern: "athletes{/:id}*",
  },
];

export default function App() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const { session, setLoading, clearSession, loading } = useSessionStore();

  const AUTHENTICATION: Authentication = {
    signIn: () => {},
    signOut: async () => {
      setLoading(true);
      try {
        await logoutAPI();
      } catch (error) {
      } finally {
        clearSession();
      }
    },
  };

  return (
    <ReactRouterAppProvider
      navigation={NAVIGATION}
      branding={{
        title: isMdUp
          ? "Sportchilarning biosignallarini tahlil qilish tizimi"
          : "",
      }}
      session={session as any}
      authentication={AUTHENTICATION}
    >
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 10 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <NotificationsProvider>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </NotificationsProvider>
    </ReactRouterAppProvider>
  );
}
