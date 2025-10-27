import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

import { useState } from "react";
import { useNotifications } from "@toolpad/core/useNotifications";
import { deleteExerciseAPI, listExercisesAPI } from "../../../api/exercise";
import type { Exercise } from "../../../types/Core";
import { formatDataTimeISO } from "../../../utils/funtions";
import { MuscleFatiqueModal } from "./MuscleFatiqueModal";

export const Exercises = () => {
  const trainingId = useParams().trainingId as string;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isOpenMFModal, setIsOpenMFModal] = useState(false);
  const [selected, setSelected] = useState<Exercise | undefined>(undefined);
  const notifications = useNotifications();

  const { data, isFetching, refetch } = useQuery({
    queryKey: [trainingId, "get-training-exercises"],
    queryFn: () => listExercisesAPI(trainingId),
  });

  const { mutateAsync: deleteMutationAsync, isPending: isDeleting } =
    useMutation({
      mutationFn: (id: number) => deleteExerciseAPI(id),
      onSuccess: () => {
        refetch();
        notifications.show("O'chirildi!", {
          autoHideDuration: 3000,
          severity: "success",
        });
      },
    });

  const onDelete = (data: Exercise) => {
    const ok = confirm("O'chirilsinmi?");
    if (ok) {
      setSelected(data);
      deleteMutationAsync(data?.id as number).finally(() =>
        setSelected(undefined)
      );
    }
  };

  return (
    <>
      <MuscleFatiqueModal
        training_id={trainingId}
        open={isOpenMFModal}
        onClose={() => setIsOpenMFModal(false)}
      />
      <Accordion expanded={isExpanded}>
        <AccordionSummary
          onClick={() => setIsExpanded((e) => !e)}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="exercises-content"
          id="exercises-header"
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%" }}
          >
            <Typography>Mashqlar</Typography>

            {/* Qo‘shimcha tugma */}
            <Button
              sx={{ mr: 1 }}
              size="small"
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={(e) => {
                e.stopPropagation(); // accordion ochilishini to‘xtatadi
                setIsOpenMFModal(true);
              }}
            >
              Charchoq qiymatlari grafigi
            </Button>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {isFetching && <LinearProgress />}
          <Box sx={{ overflow: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Boshi / Oxiri</TableCell>
                  <TableCell>Signal uzunligi</TableCell>
                  <TableCell>Yurak darajasi</TableCell>
                  <TableCell>Izoh</TableCell>
                  <TableCell>Charchoq qiymatlari</TableCell>
                  <TableCell>Qayd vaqti</TableCell>

                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.results?.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      {p.first_count} / {p.last_count}
                    </TableCell>
                    <TableCell>{p.signal_length}</TableCell>
                    <TableCell>{p.hrate}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell>
                      <Stack component={"span"}>
                        {p.muscles?.map((m) => (
                          <Typography key={m.id}>
                            {m.muscle.shortname} - {m.fatigue.toFixed(2)}
                          </Typography>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>{formatDataTimeISO(p.created_at)}</TableCell>

                    <TableCell>
                      <Stack spacing={1} direction={"row"} component={"span"}>
                        <IconButton
                          disabled={selected?.id === p.id && isDeleting}
                          onClick={() => onDelete(p)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!isFetching && data?.results.length === 0 && (
              <Typography p={2} textAlign={"center"}>
                Ma'lumotlar mavjud emas
              </Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  );
};
