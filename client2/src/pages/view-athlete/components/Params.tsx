import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
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
import {
  createAthleteParamAPI,
  deleteAthleteParamAPI,
  editAthleteParamAPI,
  listAthleteParamsAPI,
} from "../../../api/athletes";
import { useState } from "react";
import { AthleteParamsModal } from "./AthleteParamsModal";
import type { AthleteParams } from "../../../types/Athlete";
import { useNotifications } from "@toolpad/core/useNotifications";
import { formatDataTimeISO } from "../../../utils/funtions";

export const Params = () => {
  const id = useParams().id as string;
  const [isExpanded, setIsExpanded] = useState(true);
  const [selected, setSelected] = useState<AthleteParams | undefined>(
    undefined
  );
  const notifications = useNotifications();
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const {
    data: params,
    isFetching: isFetchingParams,
    refetch,
  } = useQuery({
    queryKey: [id, "get-athlete-params"],
    queryFn: () => listAthleteParamsAPI(id),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AthleteParams) => createAthleteParamAPI(data),
    onSuccess: () => {
      refetch();
      notifications.show("Yaratildi!", {
        autoHideDuration: 3000,
        severity: "success",
      });
    },
  });

  const { mutate: edit, isPending: isEditing } = useMutation({
    mutationFn: (data: AthleteParams) =>
      editAthleteParamAPI(data.id as number, data),
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
      mutationFn: (id: number) => deleteAthleteParamAPI(id),
      onSuccess: () => {
        refetch();
        notifications.show("O'chirildi!", {
          autoHideDuration: 3000,
          severity: "success",
        });
      },
    });

  const onCreate = (data: AthleteParams) => {
    data["athlete"] = parseInt(id) as any;
    mutate(data);
  };

  const onEdit = (data: AthleteParams) => {
    data["athlete"] = parseInt(id) as any;
    edit(data);
  };

  const onDelete = (data: AthleteParams) => {
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
      <AthleteParamsModal
        athleteParams={selected}
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
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography variant="h6" mb={1}>
            Parametrlar
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack p={1} direction={"row"} justifyContent={"end"}>
            <Button variant="contained" onClick={() => setIsOpenAddModal(true)}>
              Qo'shish
            </Button>
          </Stack>
          {isFetchingParams && <LinearProgress />}
          <Box sx={{ overflow: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№</TableCell>
                  <TableCell>Og'irligi</TableCell>
                  <TableCell>Balandligi</TableCell>
                  <TableCell>BMI</TableCell>
                  <TableCell>Qayd etilgan vaqti</TableCell>
                  <TableCell>Izoh</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {params?.results?.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {i + 1}
                      {i === params.results.length - 1 ? (
                        <Chip
                          sx={{ ml: 1 }}
                          label="Joriy"
                          color="success"
                          variant="filled"
                        />
                      ) : (
                        <Chip
                          sx={{ ml: 1 }}
                          label="Eski"
                          color="warning"
                          variant="filled"
                        />
                      )}
                    </TableCell>
                    <TableCell>{p.weight}</TableCell>
                    <TableCell>{p.height}</TableCell>
                    <TableCell>{p.bmi}</TableCell>
                    <TableCell>{formatDataTimeISO(p.created_at)}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!isFetchingParams && params?.results.length === 0 && (
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
