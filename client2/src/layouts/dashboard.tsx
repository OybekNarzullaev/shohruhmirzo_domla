import Stack from "@mui/material/Stack";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, useLocation, useNavigate } from "react-router";
import { DashboardLayout, ThemeSwitcher } from "@toolpad/core/DashboardLayout";
import { Account } from "@toolpad/core/Account";

import { useSessionStore } from "../store/auth";
import { useEffect } from "react";

function CustomActions() {
  return (
    <Stack direction="row" alignItems="center">
      <ThemeSwitcher />
      <Account
        localeText={{
          accountSignOutLabel: "Tizimdan chiqish",
          accountSignInLabel: "Tizimga kirish",
        }}
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
  const { session, setSession, setLoading, token, clearSession } =
    useSessionStore();
  const location = useLocation();
  const navigation = useNavigate();

  useEffect(() => {
    if (!token && !session) {
      const redirectTo = `/sign-in?callbackUrl=${encodeURIComponent(location.pathname)}`;
      navigation(redirectTo);
    }
  }, [token]);

  return (
    <DashboardLayout
      sx={{ bgcolor: "action.hover" }}
      slots={{ toolbarActions: CustomActions }}
    >
      <Outlet />
    </DashboardLayout>
  );
}
