import { useQuery } from "@tanstack/react-query";
import { kLoadGraphAPI } from "../../../api/athletes";
import { useParams } from "react-router";
import { listMusclesAPI } from "../../../api/muscle";
import { useEffect, useState } from "react";
import SyncIcon from "@mui/icons-material/Sync";
import type { Muscle } from "../../../types/Core";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Layout } from "plotly.js";
import Plot from "react-plotly.js";

export const KLoadGraph = () => {
  const id = useParams().id as string;
  const [selectedMuscle, setSelectedMuscle] = useState<Muscle | undefined>(
    undefined
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    data: muscles,
    refetch: refetchMuscles,
    isFetching,
  } = useQuery({
    queryKey: [id, "athlete", "muscles"],
    queryFn: () => listMusclesAPI(undefined, id),
    refetchOnWindowFocus: false,
  });

  const {
    data = {},
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["k-load", id, selectedMuscle],
    enabled: false,
    queryFn: () => kLoadGraphAPI(id, selectedMuscle?.shortname as string),
  });

  const layout: Partial<Layout> = {
    title: { text: selectedMuscle?.title ?? "Grafik" },
    xaxis: { title: { text: "Ketma-ketlik" } },
    yaxis: { title: { text: "Yuklamaga moslashish" } },
    autosize: true,
    height: 500,
  };

  const { signals = {}, columns = [] } = data as any;

  const traces = columns.map((col: any) => ({
    x: signals["datetimes"],
    y: signals[col],
    type: "scatter",
    mode: "lines+markers",
    name: col,
  }));

  useEffect(() => {
    if (selectedMuscle && id) refetch();
  }, [id, selectedMuscle]);

  return (
    <Accordion expanded={isExpanded}>
      <AccordionSummary
        onClick={() => setIsExpanded((e) => !e)}
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography variant="h6" mb={1}>
          Yuklamaga moslashish
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {isLoading && <LinearProgress />}
        <Stack sx={{ my: 2 }} direction={"row"} spacing={1}>
          <Autocomplete
            sx={{ flex: 1 }}
            onChange={(_event: any, newValue: string | null) => {
              setSelectedMuscle(newValue as any);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Muskul turi" />
            )}
            options={
              muscles?.map((option) => ({
                label: `${option.title} - ${option.shortname}`,
                id: option.id,
                name: option.name,
                shortname: option.shortname,
                title: option.title,
              })) || ([] as any)
            }
          ></Autocomplete>
          <IconButton disabled={isFetching} onClick={() => refetchMuscles()}>
            <SyncIcon />
          </IconButton>
        </Stack>

        <Box width={"100%"} overflow={"auto"}>
          <Plot
            data={traces as any}
            layout={layout}
            config={{
              responsive: true,
              displaylogo: false,
            }}
            style={{ width: "100%", minWidth: 500 }}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};
