import { Navbar } from "@/components/Navbar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router";

export const MainLayout = () => {
  const theme = useTheme();
  return (
    <Stack height={"100vh"} overflow={"hidden"} bgcolor={theme.palette.divider}>
      <Navbar />
      <Box flex={1} height={"100%"}>
        <Outlet />
      </Box>
    </Stack>
  );
};
