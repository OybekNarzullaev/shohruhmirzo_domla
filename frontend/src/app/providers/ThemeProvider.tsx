import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type React from "react";
import { useThemeSwitcher } from "@/store/theme";

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});
interface Props {
  children: React.ReactNode;
}
export const AppThemeProvider = ({ children }: Props) => {
  const { isDarkMode } = useThemeSwitcher();
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
