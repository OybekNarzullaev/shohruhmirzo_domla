import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getAthleteAPI } from "../../../api/athletes";
import { useState } from "react";

export const Common = () => {
  const id = useParams().id as string;
  const [isExpanded, setIsExpanded] = useState(true);

  //   asosisy
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [id, "get-one-athlete"],
    queryFn: () => getAthleteAPI(id),
  });

  return (
    <Accordion expanded={isExpanded}>
      <AccordionSummary
        onClick={() => setIsExpanded((e) => !e)}
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
      >
        <Typography variant="h6" mb={1}>
          Umumiy ma'lumotlar
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {isFetching && <LinearProgress />}

        <Stack
          spacing={2}
          direction={{ lg: "row", xl: "row", md: "row" }}
          alignItems={"start"}
        >
          <Box
            component={"img"}
            src={data?.picture as string}
            alt=""
            sx={{
              height: 200,
              width: 200,
            }}
          />
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>F.I.Sh</TableCell>
                <TableCell>{data?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Darajasi</TableCell>
                <TableCell>{data?.level?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tug'ilgan yili</TableCell>
                <TableCell>{data?.birth_year}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ro'yhatga olingan vaqti</TableCell>
                <TableCell>{data?.created_at}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Oxirgi tahrir vaqti</TableCell>
                <TableCell>{data?.updated_at}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Stack>
        <Stack p={1} direction={"row"} justifyContent={"end"}>
          <Button variant="contained">Tahrirlash</Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
