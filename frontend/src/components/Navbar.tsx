import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import { useSidebar } from "@/store/sidebar";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import Typography from "@mui/material/Typography";
import { useAuthStore } from "@/store/auth";
import { Link } from "react-router";
import { ThemeSwitcher } from "./ThemeSwitcher";

export const Navbar = () => {
  const theme = useTheme();
  const { toggle } = useSidebar();
  const { logout, isAuth, isLoading } = useAuthStore();
  return (
    <AppBar
      position="sticky"
      variant="outlined"
      sx={{ bgcolor: theme.palette.background.default, width: "100%" }}
    >
      <Toolbar>
        <IconButton
          onClick={toggle}
          size="large"
          edge="start"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1 }}
          color="primary"
        ></Typography>
        <ThemeSwitcher />
        {isAuth ? (
          <Button
            loading={isLoading}
            onClick={() => {
              logout();
            }}
            variant="contained"
            startIcon={<LogoutIcon />}
          >
            Tizimdan chiqish
          </Button>
        ) : (
          <Link to={"/auth/login"}>
            <Button variant="contained" startIcon={<LoginIcon />}>
              Tizimga kirish
            </Button>
          </Link>
        )}
      </Toolbar>
    </AppBar>
  );
};
