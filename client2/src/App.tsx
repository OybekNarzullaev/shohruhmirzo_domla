import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import type { Navigation, Authentication } from "@toolpad/core/AppProvider";
import { useSessionStore } from "./store/auth";
import { getProfileAPI, logoutAPI } from "./api/auth";
import { useTheme, useMediaQuery, Box } from "@mui/material";
import {
  NotificationsProvider,
  useNotifications,
} from "@toolpad/core/useNotifications";
import { Backdrop, CircularProgress } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNetworkStore } from "./store/network";
import { NetworkStatus } from "./components/NetworkStatus";

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
    pattern: "athletes{/:athleteId}*",
  },
];

export default function App() {
  const theme = useTheme();
  const notifications = useNotifications();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const { session, setLoading, clearSession, setSession, loading } =
    useSessionStore();

  const AUTHENTICATION: Authentication = {
    signIn: () => {},
    signOut: async () => {
      setLoading(true);
      try {
        await logoutAPI();
      } finally {
        clearSession();
      }
    },
  };

  useEffect(() => {
    if (!session) {
      getProfileAPI().then((res) =>
        setSession({
          user: res.data,
        })
      );
    }

    window.addEventListener("online", () => {
      useNetworkStore.getState().setOnline(true);
      notifications.show("Yana onlinedasiz!", {
        autoHideDuration: 3000,
        severity: "success",
      });
    });
    window.addEventListener("offline", () => {
      useNetworkStore.getState().setOnline(false);
      notifications.show("Siz offlinedasiz!", {
        autoHideDuration: 3000,
        severity: "error",
      });
    });
  }, []);

  return (
    <ReactRouterAppProvider
      navigation={NAVIGATION}
      branding={{
        title: isMdUp ? "Sport AI" : "",
        logo: (
          <Box
            component={"img"}
            sx={{ maxWidth: 160 }}
            src="/public/static/media/logo.png"
          />
        ),
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
      <NetworkStatus />
      <NotificationsProvider>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </NotificationsProvider>
    </ReactRouterAppProvider>
  );
}
