import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
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
  const { id } = useParams<{ id: any }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<TrainingSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const notifications = useNotifications();

  // === 1. Mashg‘ulotlar ===
  const {
    data: response,
    isFetching: isFetchingTrainings,
    refetch,
  } = useQuery({
    queryKey: ["athlete-trainings", id],
    queryFn: () => listTrainingSesssionsAPI(id),
    enabled: !!id,
  });

  const trainings = response?.results || [];
  const isLoading = isFetchingTrainings || !response;

  // === 2. Mutatsiyalar ===
  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (data: TrainingSession) =>
      createTrainingSessionAPI({ ...data, athlete: parseInt(id) }),
    onSuccess: () => {
      refetch();
      closeModal();
      notifications.show("Mashg‘ulot yaratildi", { severity: "success" });
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (data: TrainingSession) =>
      editTrainingSessionAPI(data.id!, { ...data, athlete: parseInt(id) }),
    onSuccess: () => {
      refetch();
      closeModal();
      notifications.show("Mashg‘ulot tahrirlandi", { severity: "success" });
    },
  });

  const { mutateAsync: remove, isPending: isDeleting } = useMutation({
    mutationFn: (sessionId: number) => deleteTrainingSessionAPI(sessionId),
    onSuccess: () => {
      refetch();
      notifications.show("Mashg‘ulot o‘chirildi", { severity: "success" });
    },
  });

  // === 3. Modal boshqaruv ===
  const openCreateModal = () => {
    setSelected(null);
    setIsModalOpen(true);
  };

  const openEditModal = (session: TrainingSession) => {
    setSelected(session);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const handleSubmit = (data: TrainingSession) => {
    if (selected) {
      update(data);
    } else {
      create(data);
    }
  };

  const handleDelete = async (session: TrainingSession) => {
    if (!window.confirm("Bu mashg‘ulotni o‘chirishni xohlaysizmi?")) return;
    try {
      await remove(session.id!);
    } catch {
      notifications.show("Xatolik yuz berdi", { severity: "error" });
    }
  };

  // === 4. Ranglar (Dark Mode) ===
  const bgColor = isDark ? "grey.900" : "background.paper";
  const borderColor = isDark ? "grey.700" : "grey.300";
  const hoverBg = theme.palette.action.hover;
  const textSecondary = theme.palette.text.secondary;

  return (
    <>
      {/* Modal */}
      <TrainingSessionModal
        trainingSession={selected || undefined}
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
          <FitnessCenterIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="h6" fontWeight="medium">
            Mashg‘ulotlar
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Qo'shish tugmasi */}
          <Stack direction="row" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateModal}
              disabled={isCreating}
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
                  height={64}
                  sx={{ bgcolor: isDark ? "grey.800" : "grey.200" }}
                />
              ))}
            </Stack>
          ) : trainings.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">Mashg‘ulotlar mavjud emas</Typography>
              <Typography variant="body2" mt={1}>
                Yangi mashg‘ulot qo‘shish uchun “Qo‘shish” tugmasini bosing.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      №
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Nomi
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Sport turi
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Mashqlar
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Yurak urishi
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Davomiyligi
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      EMT
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      ECG
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Izoh
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Sana
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Amallar
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainings.map((t, i) => (
                    <TableRow
                      key={t.id}
                      sx={{
                        "&:hover": { bgcolor: hoverBg },
                        transition: "background 0.2s",
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {i + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {t.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t?.sport_type_name || "—"}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t.exercise_count}
                          size="small"
                          color="info"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Typography variant="body2">
                            {t.pre_heart_rate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            /
                          </Typography>
                          <Typography variant="body2">
                            {t.post_heart_rate}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(t.duration / 1000).toFixed(1)} s
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {t.file_EMT ? (
                          <IconButton
                            component="a"
                            href={t.file_EMT}
                            target="_blank"
                            rel="noopener"
                            size="small"
                            color="success"
                            title="EMT faylni yuklab olish"
                            sx={{
                              color: "white",
                              bgcolor: isDark
                                ? "success.dark"
                                : "success.light",
                              "&:hover": {
                                bgcolor: "success.main",
                              },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.file_ECG ? (
                          <IconButton
                            component="a"
                            href={t.file_ECG}
                            target="_blank"
                            rel="noopener"
                            size="small"
                            color="info"
                            title="ECG faylni yuklab olish"
                            sx={{
                              color: "white",
                              bgcolor: isDark ? "info.dark" : "info.light",
                              "&:hover": {
                                bgcolor: "info.main",
                              },
                            }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 160,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={t.description}
                        >
                          {t.description || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {formatDataTimeISO(t.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <IconButton
                            component={Link}
                            to={`/athletes/${id}/trainings/${t.id}`}
                            size="small"
                            color="primary"
                            title="Ko‘rish"
                            sx={{
                              color: "white",
                              bgcolor: isDark
                                ? "primary.dark"
                                : "primary.light",
                              "&:hover": {
                                bgcolor: "primary.main",
                                color: "white",
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openEditModal(t)}
                            title="Tahrirlash"
                            sx={{
                              color: "white",
                              bgcolor: isDark
                                ? "warning.dark"
                                : "warning.light",
                              "&:hover": {
                                bgcolor: "warning.main",
                                color: "white",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(t)}
                            disabled={isDeleting}
                            title="O‘chirish"
                            sx={{
                              color: "white",
                              bgcolor: isDark ? "error.dark" : "error.light",
                              "&:hover": {
                                bgcolor: "error.main",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
};
