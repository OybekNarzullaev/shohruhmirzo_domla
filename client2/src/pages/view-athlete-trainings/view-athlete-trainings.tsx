import { Trainings } from "./components/Trainings";
import { KLoadGraph } from "./components/KLoadGraph";
import { FatiguesByTrainingGraph } from "./components/FatiguesByTrainingGraph";
import { useParams } from "react-router";
import { getAthleteAPI } from "@/api/athletes";
import { useQuery } from "@tanstack/react-query";
import { useActivePage } from "@toolpad/core/useActivePage";
import invariant from "invariant";
import { PageContainer } from "@toolpad/core/PageContainer";

const ViewAthleteTrainingsPage = () => {
  const id = useParams().id as string;

  //   asosisy
  const { data: athlete } = useQuery({
    queryKey: [id, "get-one-athlete"],
    queryFn: () => getAthleteAPI(id),
  });

  const activePage: any = useActivePage();
  invariant(activePage, "No navigation match");

  const title = athlete?.name;
  const path = `${activePage?.path}/${id}`;

  const breadcrumbs = [...activePage.breadcrumbs, { title, path }];
  return (
    <PageContainer breadcrumbs={breadcrumbs} title={title || `Yuklanmoqda...`}>
      <Trainings />
      <FatiguesByTrainingGraph />
      <KLoadGraph />
    </PageContainer>
  );
};

export default ViewAthleteTrainingsPage;
