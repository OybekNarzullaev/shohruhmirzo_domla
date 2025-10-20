import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import type { Navigation, Authentication } from "@toolpad/core/AppProvider";
import { useSessionStore } from "./store/auth";
import { logoutAPI } from "./api/auth";

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
    pattern: "pages/athletes",
  },
];

const BRANDING = {
  title: "Sport",
};

export default function App() {
  const { session, setLoading, clearSession } = useSessionStore();
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
      branding={BRANDING}
      session={session as any}
      authentication={AUTHENTICATION}
    >
      <Outlet />
    </ReactRouterAppProvider>
  );
}
