import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useParams } from "react-router";
import { getAthleteAPI } from "../../api/athletes";
import { useActivePage } from "@toolpad/core/useActivePage";
import invariant from "invariant";
import { getTrainingSesssionAPI } from "../../api/training";
import MuscleSignalsPlot from "./components/MuscleSignalsPlot";
import { Exercises } from "./components/Exercises";

const ViewTrainingPage = () => {
  const id = useParams().id as string;
  const trainingId = useParams().trainingId as string;

  //   sportchi
  const { data: athlete } = useQuery({
    queryKey: [id, "get-one-athlete"],
    queryFn: () => getAthleteAPI(id),
  });

  //   mashg'ulot
  const { data: training } = useQuery({
    queryKey: [trainingId, "get-training"],
    queryFn: () => getTrainingSesssionAPI(trainingId),
  });

  const activePage: any = useActivePage();
  invariant(activePage, "No navigation match");

  const breadcrumbs = [
    ...activePage.breadcrumbs,
    { title: athlete?.name, path: `${activePage?.path}/${id}` },
    {
      title: training?.title,
    },
  ];
  return (
    <PageContainer
      breadcrumbs={breadcrumbs}
      title={training?.title || `Yuklanmoqda...`}
    >
      <MuscleSignalsPlot />
      <Exercises />
    </PageContainer>
  );
};

export default ViewTrainingPage;
