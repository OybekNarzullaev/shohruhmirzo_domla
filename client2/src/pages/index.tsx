import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid3x3Icon from "@mui/icons-material/Grid3x3";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Link } from "react-router";

export default function HomePage() {
  return (
    <PageContainer>
      <Stack
        height={"100%"}
        spacing={1}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Typography variant="h4" color="primary">
          Sportchilarning biosignallarini tahlil qilish tizimi!
        </Typography>
        <Link to={"/athletes"}>
          <Button startIcon={<Grid3x3Icon />} variant="contained">
            Ma'lumotlarga o'tish
          </Button>
        </Link>
      </Stack>
    </PageContainer>
  );
}
