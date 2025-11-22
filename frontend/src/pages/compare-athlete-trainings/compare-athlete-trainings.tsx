import { getAthleteAPI } from "@/api/athletes";
import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useActivePage } from "@toolpad/core/useActivePage";
import invariant from "invariant";
import { useParams, useSearchParams } from "react-router";
import { CompareMuscleGraph } from "./components/CompareMuscleGraph";
import { AthleteInfo } from "@/components/AthleteInfo";
import { FatiguesByTrainingGraph } from "@/components/FatiguesByTrainingGraph";
import { KLoadGraph } from "@/components/KLoadGraph";

const CompareAthleteTrainingsPage = () => {
  const id = useParams().id as string;
  const [searchParams] = useSearchParams();
  const ids = searchParams.get("ids") as string;

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
      <AthleteInfo id={id} />
      <CompareMuscleGraph
        athleteId={id}
        selectedTrainingIds={ids.split(",").map((s) => parseInt(s))}
      />
      <FatiguesByTrainingGraph id={id} training_ids={ids} />
      <KLoadGraph id={id} training_ids={ids} />
    </PageContainer>
  );
};

export default CompareAthleteTrainingsPage;
