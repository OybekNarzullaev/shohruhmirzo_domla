import { AthleteInfo } from "@/components/AthleteInfo";
import { AdaptationChart } from "@/components/chars/AdaptationChart";
import { FatigueChart } from "@/components/chars/FatigueChart";
import { Lines } from "@/components/chars/Lines";
import { PageContainer } from "@/layouts/PageContainer";
import Stack from "@mui/material/Stack";

const ViewAthletePage = () => {
  return (
    <PageContainer
      title="Oybek Narzullayev"
      breadcrumbs={[
        { title: "Asosiy", path: "/" },
        { title: "Sportchilar", path: "/athlete" },
        { title: "Oybek Narzullayev" },
      ]}
    >
      <Stack maxWidth={480}>
        <AthleteInfo
          athlete={{
            id: 1,
            fullname: "Oybek Narzullayev",
            height: 175,
            weight: 65,
            year_of_birth: 1999,
            profile_pic: "",
          }}
        />
      </Stack>
      <Stack mt={2}>
        <Lines />
      </Stack>
      <Stack mt={2}>
        <FatigueChart />
      </Stack>
      <Stack mt={2}>
        <AdaptationChart />
      </Stack>
    </PageContainer>
  );
};

export default ViewAthletePage;
