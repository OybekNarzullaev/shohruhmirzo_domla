import { PageContainer } from "@/layouts/PageContainer";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";

const HomePage = () => {
  return (
    <PageContainer title="Bosh sahifa" breadcrumbs={[{ title: "Asosiy" }]}>
      <Stack
        gap={2}
        alignItems={"center"}
        height={"100%"}
        justifyContent={"center"}
      >
        <Typography variant="h4">Tizimga xush kelibsiz</Typography>
        <Link to={"/athlete"}>
          <Button variant="contained">Ma'lumotlarni ko'rish</Button>
        </Link>
      </Stack>
    </PageContainer>
  );
};

export default HomePage;
