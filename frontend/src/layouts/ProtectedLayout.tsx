import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useAuthStore } from "@/store/auth";
import { useSidebar } from "@/store/sidebar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { Navigate, Outlet } from "react-router";

const ProtectedLayout = () => {
  const theme = useTheme();
  const { isAuth } = useAuthStore();
  const { isOpen } = useSidebar();
  if (!isAuth) return <Navigate to={"/auth/login"} />;
  return (
    <Stack
      height={"100vh"}
      overflow={"hidden"}
      flexDirection={"row"}
      bgcolor={theme.palette.action.selected}
    >
      <Sidebar />
      <Divider orientation="vertical" />
      <Stack
        overflow={"hidden"}
        sx={{
          width: {
            xl: isOpen ? "80%" : "96%",
            lg: isOpen ? "80%" : "96%",
            md: isOpen ? "50%" : "90%",
            sm: isOpen ? "100%" : "100%",
            xs: isOpen ? "100%" : "100%",
          },
        }}
      >
        <Navbar />

        <Box flex={1} overflow={"hidden"}>
          <Outlet />
        </Box>
      </Stack>
    </Stack>
  );
};

export default ProtectedLayout;
