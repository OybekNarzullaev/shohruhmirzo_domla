import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
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
  const { id } = useParams<{ id: any }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<AthleteParams | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const notifications = useNotifications();

  // === 1. Parametrlar ===
  const {
    data: response,
    isFetching: isFetchingParams,
    refetch,
  } = useQuery({
    queryKey: ["athlete-params", id],
    queryFn: () => listAthleteParamsAPI(id),
    enabled: !!id,
  });

  const params = response?.results || [];
  const isLoading = isFetchingParams || !response;

  // === 2. Mutatsiyalar ===
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (data: AthleteParams) =>
      createAthleteParamAPI({ ...data, athlete: id as any }),
    onSuccess: () => {
      refetch();
      closeModal();
      notifications.show("Parametr yaratildi", { severity: "success" });
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (data: AthleteParams) =>
      editAthleteParamAPI(data.id!, { ...data, athlete: id }),
    onSuccess: () => {
      refetch();
      closeModal();
      notifications.show("Parametr tahrirlandi", { severity: "success" });
    },
  });

  const { mutateAsync: remove, isPending: isDeleting } = useMutation({
    mutationFn: (paramId: number) => deleteAthleteParamAPI(paramId),
    onSuccess: () => {
      refetch();
      notifications.show("Parametr o‘chirildi", { severity: "success" });
    },
  });

  // === 3. Modal boshqaruv ===
  const openCreateModal = () => {
    setSelected(null);
    setIsModalOpen(true);
  };

  const openEditModal = (param: AthleteParams) => {
    setSelected(param);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const handleSubmit = (data: AthleteParams) => {
    if (selected) {
      update(data);
    } else {
      create(data);
    }
  };

  const handleDelete = async (param: AthleteParams) => {
    if (!window.confirm("Bu parametrni o‘chirishni xohlaysizmi?")) return;
    try {
      await remove(param.id!);
    } catch {
      notifications.show("Xatolik yuz berdi", { severity: "error" });
    }
  };

  // === 4. Ranglar (Dark Mode) ===
  const bgColor = isDark ? "grey.900" : "background.paper";
  const borderColor = isDark ? "grey.700" : "grey.300";
  const hoverBg = theme.palette.action.hover;

  return (
    <>
      {/* Modal */}
      <AthleteParamsModal
        athleteParams={selected || undefined}
        open={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      {/* Accordion */}
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded((prev) => !prev)}
        sx={{
          borderRadius: 2,
          bgcolor: bgColor,
          boxShadow: isDark ? 4 : 3,
          border: `1px solid ${borderColor}`,
          "&:before": { display: "none" },
          transition: "all 0.3s ease",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "background.default" }} />}
          sx={{
            bgcolor: "primary.main",
            color: "background.default",
            borderRadius: expanded ? "8px 8px 0 0" : 2,
            minHeight: 56,
            "& .MuiAccordionSummary-content": { alignItems: "center" },
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          <Typography variant="h6" fontWeight="medium">
            Parametrlar
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Qo'shish tugmasi */}
          <Stack direction="row" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateModal}
            >
              Qo‘shish
            </Button>
          </Stack>

          {/* Loading */}
          {isLoading ? (
            <Stack spacing={1}>
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  height={56}
                  sx={{ bgcolor: isDark ? "grey.800" : "grey.200" }}
                />
              ))}
            </Stack>
          ) : params.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">Parametrlar mavjud emas</Typography>
              <Typography variant="body2" mt={1}>
                Yangi parametr qo‘shish uchun “Qo‘shish” tugmasini bosing.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                      №
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                      Og‘irligi
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                      Bo‘yi
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                      BMI
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                      Sana
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                      Izoh
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", color: "text.secondary" }}
                    >
                      Amallar
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {params.map((p, i) => {
                    const isLatest = i === params.length - 1;
                    return (
                      <TableRow
                        key={p.id}
                        sx={{
                          "&:hover": { bgcolor: hoverBg },
                          transition: "background 0.2s",
                        }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography variant="body2">{i + 1}</Typography>
                            <Chip
                              label={isLatest ? "Joriy" : "Eski"}
                              size="small"
                              color={isLatest ? "success" : "warning"}
                              sx={{
                                fontSize: "0.65rem",
                                height: 20,
                                bgcolor: isLatest
                                  ? isDark
                                    ? "success.dark"
                                    : "success.light"
                                  : isDark
                                    ? "warning.dark"
                                    : "warning.light",
                                color: isLatest
                                  ? "success.contrastText"
                                  : "warning.contrastText",
                              }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>{p.weight} kg</TableCell>
                        <TableCell>{p.height} sm</TableCell>
                        <TableCell>
                          <Chip
                            label={p?.bmi?.toFixed(2)}
                            size="small"
                            color={
                              p.bmi < 18.5
                                ? "info"
                                : p.bmi < 25
                                  ? "success"
                                  : p.bmi < 30
                                    ? "warning"
                                    : "error"
                            }
                            sx={{ fontWeight: "medium" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap>
                            {formatDataTimeISO(p.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={p.description}
                          >
                            {p.description || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <IconButton
                              size="small"
                              onClick={() => openEditModal(p)}
                              title="Tahrirlash"
                              sx={{
                                color: "background.default",
                                bgcolor: isDark
                                  ? "primary.dark"
                                  : "primary.light",
                                "&:hover": {
                                  bgcolor: "primary.main",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(p)}
                              disabled={isDeleting}
                              title="O‘chirish"
                              sx={{
                                color: "background.default",
                                bgcolor: isDark ? "error.dark" : "error.light",
                                "&:hover": {
                                  bgcolor: "error.main",
                                  color: "background.default",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
};
