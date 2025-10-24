import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import { useNetworkStore } from "../store/network";

export const NetworkStatus = () => {
  const { isOnline, isFirstLoad } = useNetworkStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Faqat status o‘zgarganda ko‘rsatamiz

    setOpen(true);
    const timeout = setTimeout(() => setOpen(false), 3000);
    return () => clearTimeout(timeout);
  }, [isOnline]);

  return (
    <Collapse in={open && !isFirstLoad} appear>
      <Alert
        severity={isOnline ? "success" : "error"}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1500,
          borderRadius: "12px",
        }}
      >
        {isOnline ? "Online: internet ulandi" : "Offline: internet uzildi"}
      </Alert>
    </Collapse>
  );
};
