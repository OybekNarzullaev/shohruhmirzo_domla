import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useParams } from "react-router";
import { getAthleteAPI } from "../../api/athletes";
import { useActivePage } from "@toolpad/core/useActivePage";
import invariant from "invariant";

import { Params } from "./components/Params";
import { Common } from "./components/Common";

const ViewAthletePage = () => {
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
      <Common />
      <Params />
    </PageContainer>
  );
};

export default ViewAthletePage;
