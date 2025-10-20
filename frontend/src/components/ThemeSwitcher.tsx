import { useThemeSwitcher } from "@/store/theme";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Brightness4Icon from "@mui/icons-material/Brightness4";

export const ThemeSwitcher = () => {
  const { toggleTheme, isDarkMode } = useThemeSwitcher();
  return (
    <Tooltip title="Mavzuni almashtirish">
      <IconButton
        sx={{ border: 1, borderColor: "primary.main", color: "primary.main" }}
        onClick={toggleTheme}
      >
        {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};
