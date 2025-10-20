import { Typography } from "@mui/material";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useEffect } from "react";
import { listAthletesAPI } from "../api/athletes";

const Athletes = () => {
  useEffect(() => {
    listAthletesAPI();
  }, []);
  return (
    <PageContainer>
      <Typography>Welcome to Toolpad Core!</Typography>
    </PageContainer>
  );
};

export default Athletes;
