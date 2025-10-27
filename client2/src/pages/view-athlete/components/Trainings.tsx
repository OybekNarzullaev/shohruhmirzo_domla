import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
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
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  createTrainingSessionAPI,
  deleteTrainingSessionAPI,
  editTrainingSessionAPI,
  listTrainingSesssionsAPI,
} from "../../../api/training";
import { useState } from "react";
import { type TrainingSession } from "../../../types/Core";
import { useNotifications } from "@toolpad/core/useNotifications";
import { TrainingSessionModal } from "./TrainingSessionModal";
import { formatDataTimeISO } from "../../../utils/funtions";

export const Trainings = () => {
  const id = useParams().id as string;
  const [isExpanded, setIsExpanded] = useState(true);
  const [selected, setSelected] = useState<TrainingSession | undefined>(
    undefined
  );
  const notifications = useNotifications();
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [id, "get-athlete-trainings"],
    queryFn: () => listTrainingSesssionsAPI(id),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TrainingSession) => createTrainingSessionAPI(data),
    onSuccess: () => {
      refetch();
      notifications.show("Yaratildi!", {
        autoHideDuration: 3000,
        severity: "success",
      });
    },
  });

  const { mutate: edit, isPending: isEditing } = useMutation({
    mutationFn: (data: TrainingSession) =>
      editTrainingSessionAPI(data.id as number, data),
    onSuccess: () => {
      refetch();
      notifications.show("Tahrirlandi!", {
        autoHideDuration: 3000,
        severity: "success",
      });
    },
  });

  const { mutateAsync: deleteMutationAsync, isPending: isDeleting } =
    useMutation({
      mutationFn: (id: number) => deleteTrainingSessionAPI(id),
      onSuccess: () => {
        refetch();
        notifications.show("O'chirildi!", {
          autoHideDuration: 3000,
          severity: "success",
        });
      },
    });

  const onCreate = (data: TrainingSession) => {
    data["athlete"] = parseInt(id) as any;
    mutate(data);
  };

  const onEdit = (data: TrainingSession) => {
    data["athlete"] = parseInt(id) as any;
    edit(data);
  };

  const onDelete = (data: TrainingSession) => {
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
      <TrainingSessionModal
        trainingSession={selected}
        isLoading={isPending || isEditing}
        open={isOpenAddModal}
        onClose={() => {
          setIsOpenAddModal(false);
          setSelected(undefined);
        }}
        onSubmit={selected ? onEdit : onCreate}
      />
      <Accordion expanded={isExpanded}>
        <AccordionSummary
          onClick={() => setIsExpanded((e) => !e)}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="training-content"
          id="training-header"
        >
          <Typography variant="h6" mb={1}>
            Mashg'ulotlar
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack p={1} direction={"row"} justifyContent={"end"}>
            <Button
              variant="contained"
              disabled={isPending}
              loading={isPending}
              onClick={() => setIsOpenAddModal(true)}
            >
              Qo'shish
            </Button>
          </Stack>
          {isFetching && <LinearProgress />}
          <Box sx={{ overflow: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Nomi</TableCell>
                  <TableCell>Sport turi</TableCell>
                  <TableCell>Mashqlar soni</TableCell>
                  <TableCell>Yurak urishi avval / keyin</TableCell>
                  <TableCell>Davomiyligi (sekund)</TableCell>
                  <TableCell>EMT fayli</TableCell>
                  <TableCell>ECG fayli</TableCell>
                  <TableCell>Izoh</TableCell>
                  <TableCell>Qayd vaqti</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.results?.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>{p.sport_type?.name}</TableCell>
                    <TableCell>{p.exercise_count}</TableCell>
                    <TableCell>
                      {p.pre_heart_rate} / {p.post_heart_rate}
                    </TableCell>
                    <TableCell>{p.duration / 1000}</TableCell>
                    <TableCell>
                      <Link to={p.file_EMT} target="_blank">
                        <IconButton color="primary">
                          <DownloadIcon color="primary" />
                        </IconButton>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={p.file_ECG} target="_blank">
                        <IconButton color="primary">
                          <DownloadIcon color="primary" />
                        </IconButton>
                      </Link>
                    </TableCell>

                    <TableCell>{p.description}</TableCell>
                    <TableCell>{formatDataTimeISO(p.created_at)}</TableCell>

                    <TableCell>
                      <Stack spacing={1} direction={"row"} component={"span"}>
                        <Link to={`trainings/${p.id}`}>
                          <IconButton>
                            <VisibilityIcon color="primary" />
                          </IconButton>
                        </Link>
                        <IconButton
                          color="warning"
                          onClick={() => {
                            setIsOpenAddModal(true);
                            setSelected(p);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
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
