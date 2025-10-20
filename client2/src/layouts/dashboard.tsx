import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, Navigate, useLocation } from "react-router";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import { Account } from "@toolpad/core/Account";

import { useSessionStore } from "../store/auth";

function CustomActions() {
  return (
    <Stack direction="row" alignItems="center">
      <ThemeSwitcher />
      <Account
        slotProps={{
          preview: {
            variant: "condensed",
            slotProps: {
              avatarIconButton: {
                sx: {
                  width: "fit-content",
                  margin: "auto",
                },
              },
              avatar: {
                variant: "rounded",
              },
            },
          },

          signOutButton: {
            color: "warning",
            variant: "contained",
            startIcon: <LogoutIcon />,
          },
        }}
      />
    </Stack>
  );
}

export default function Layout() {
  const { session, loading } = useSessionStore();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ width: "100%" }}>
        <LinearProgress />
      </div>
    );
  }

  if (!session) {
    const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <DashboardLayout slots={{ toolbarActions: CustomActions }}>
      <Outlet />
    </DashboardLayout>
  );
}
