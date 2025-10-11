import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

const NotFound = () => {
  const theme = useTheme();
  return (
    <Stack
      height={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      bgcolor={theme.palette.mode}
    >
      <Typography variant="h1" color="primary" fontWeight={"bold"}>
        404
      </Typography>
      <Typography variant="h6">Sahifa topilmadi</Typography>
    </Stack>
  );
};

export default NotFound;
