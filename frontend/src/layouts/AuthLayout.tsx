import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router";

export const AuthLayout = () => {
  const theme = useTheme();
  return (
    <Stack
      height={"100vh"}
      overflow={"hidden"}
      bgcolor={theme.palette.action.selected}
    >
      <Box flex={1} height={"100%"}>
        <Outlet />
      </Box>
    </Stack>
  );
};
