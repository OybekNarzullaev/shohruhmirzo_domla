import List from "@mui/material/List";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { useTheme } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useSidebar } from "@/store/sidebar";
import Box from "@mui/material/Box";
import { Link, useLocation } from "react-router";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import { useAuthStore } from "@/store/auth";

const MENU = [
  {
    url: "/",
    title: "Asosiy",
    Icon: HomeIcon,
  },
  {
    url: "/athlete",
    title: "Sportchilar",
    Icon: PeopleAltIcon,
  },
];

export const Sidebar = () => {
  const theme = useTheme();
  const { isOpen } = useSidebar();
  const { user } = useAuthStore();
  const location = useLocation();

  return (
    <Box
      sx={{
        width: {
          xl: isOpen ? "20%" : "4%",
          lg: isOpen ? "20%" : "4%",
          md: isOpen ? "50%" : "10%",
          sm: isOpen ? "100%" : "0%",
          xs: isOpen ? "100%" : "0%",
        },
        display: {
          xl: isOpen ? "block" : "block",
          lg: isOpen ? "block" : "block",
          md: isOpen ? "block" : "block",
          sm: isOpen ? "block" : "none",
          xs: isOpen ? "block" : "none",
        },
        position: {
          xl: "static",
          lg: "static",
          md: "static",
          sm: "absolute",
          xs: "absolute",
        },
        top: 64,
        bottom: 0,
        zIndex: {
          sm: 1,
          xs: 1,
        },
        height: "100%",
        background: theme.palette.background.paper,
      }}
    >
      <Stack p={5} gap={2} justifyContent={"center"} alignItems={"center"}>
        {isOpen && (
          <>
            <Avatar
              alt="ON"
              sx={{
                width: 96,
                height: 96,
                bgcolor: theme.palette.primary.main,
              }}
            />
            <Typography variant="h6">
              {user?.first_name} {user?.last_name}
            </Typography>
          </>
        )}
      </Stack>
      <Divider />
      <List>
        {MENU.map((item, index) => {
          const isActive =
            item.url === "/"
              ? item.url === location.pathname
              : location.pathname.startsWith(item.url);

          return (
            <ListItem
              to={item.url}
              component={Link}
              key={index}
              sx={{
                color: isActive
                  ? theme.palette.background.default
                  : theme.palette.text.primary,
                backgroundColor: isActive
                  ? theme.palette.primary.main
                  : "transparent",
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive
                    ? theme.palette.background.default
                    : theme.palette.text.secondary,
                  minWidth: 40,
                }}
              >
                <item.Icon />
              </ListItemIcon>
              {isOpen && <ListItemText primary={item.title} />}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
