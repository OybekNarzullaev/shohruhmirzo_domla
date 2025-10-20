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
import Drawer from "@mui/material/Drawer";
import { useState } from "react";

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

const drawerWidth = 240;

export const Sidebar = () => {
  const theme = useTheme();
  const { isOpen } = useSidebar();
  const { user } = useAuthStore();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box>
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
      {/* Sidebar - mobil versiya */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Sidebar - desktop versiya */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
};

const drawer = (
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
            color: isActive ? "background.default" : "text.primary",
            backgroundColor: isActive ? "primary.main" : "transparent",
          }}
        >
          <ListItemIcon
            sx={{
              color: isActive ? "background.default" : "text.secondary",
              minWidth: 40,
            }}
          >
            <item.Icon />
          </ListItemIcon>
          <ListItemText primary={item.title} />
        </ListItem>
      );
    })}
  </List>
);
