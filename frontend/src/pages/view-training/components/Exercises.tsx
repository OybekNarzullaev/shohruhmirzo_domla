import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
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
  Tooltip,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { useNotifications } from "@toolpad/core/useNotifications";
import { deleteExerciseAPI, listExercisesAPI } from "../../../api/exercise";
import type { Exercise } from "../../../types/Core";
import { formatDataTimeISO } from "../../../utils/funtions";
import { MuscleFatigueModal } from "./MuscleFatigueModal";

export const Exercises = () => {
  const { trainingId } = useParams<{ trainingId: any }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [expanded, setExpanded] = useState(true);
  const [isOpenMFModal, setIsOpenMFModal] = useState(false);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const notifications = useNotifications();

  // === 1. Mashqlar ===
  const {
    data: response,
    isFetching: isFetchingExercises,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["training-exercises", trainingId],
    queryFn: () => listExercisesAPI(trainingId),
    enabled: !!trainingId,
    refetchOnWindowFocus: false,
  });

  const exercises = response?.results || [];
  const isLoading = isFetchingExercises || !response;

  // === 2. O‘chirish ===
  const { mutateAsync: remove, isPending: isDeleting } = useMutation({
    mutationFn: (exerciseId: number) => deleteExerciseAPI(exerciseId),
    onSuccess: () => {
      refetch();
      notifications.show("Mashq o‘chirildi", { severity: "success" });
    },
  });

  const handleDelete = async (exercise: Exercise) => {
    if (!window.confirm("Bu mashqni o‘chirishni xohlaysizmi?")) return;
    try {
      setSelected(exercise);
      await remove(exercise.id!);
    } catch {
      notifications.show("Xatolik yuz berdi", { severity: "error" });
    } finally {
      setSelected(null);
    }
  };

  // === 3. Ranglar (Dark Mode) ===
  const bgColor = isDark ? "grey.900" : "background.paper";
  const borderColor = isDark ? "grey.700" : "grey.300";
  const hoverBg = theme.palette.action.hover;
  const textSecondary = theme.palette.text.secondary;

  return (
    <>
      {/* Charchoq grafigi modal */}
      <MuscleFatigueModal
        training_id={trainingId}
        open={isOpenMFModal}
        onClose={() => setIsOpenMFModal(false)}
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
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%", pr: 2 }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <FitnessCenterIcon sx={{ fontSize: 20 }} />
              <Typography variant="h6" fontWeight="medium">
                Mashqlar
              </Typography>
            </Stack>

            {/* Charchoq grafigi tugmasi */}
            <Button
              size="small"
              sx={{
                color: "background.default",
              }}
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenMFModal(true);
              }}
            >
              Charchoq grafigi
            </Button>
          </Stack>
        </AccordionSummary>

        <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
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
          ) : isError ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                color: "error.main",
              }}
            >
              <Typography variant="h6">Xatolik yuz berdi</Typography>
              <Typography variant="body2" mt={1}>
                Mashqlarni yuklab bo‘lmadi. Qayta urining.
              </Typography>
            </Box>
          ) : exercises.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">Mashqlar mavjud emas</Typography>
              <Typography variant="body2" mt={1}>
                Yangi mashq qo‘shish uchun grafikdan diapazon tanlang.
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
                      Boshi / Oxiri
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Uzunligi
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Yurak darajasi
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Izoh
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", color: textSecondary }}
                    >
                      Charchoq
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
                  {exercises.map((ex, i) => (
                    <TableRow
                      key={ex.id}
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
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Typography variant="body2">
                            {ex.first_count}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            /
                          </Typography>
                          <Typography variant="body2">
                            {ex.last_count}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${ex.signal_length} s`}
                          size="small"
                          color="info"
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ex.hrate}
                          size="small"
                          color={
                            ex.hrate > 160
                              ? "error"
                              : ex.hrate > 120
                                ? "warning"
                                : "success"
                          }
                          sx={{ fontWeight: "medium" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={ex.description} placement="top">
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 140,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ex.description || "—"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {ex.muscles?.length ? (
                            ex.muscles.map((m) => {
                              const fatigue = m.fatigue;
                              return (
                                <Chip
                                  key={m.id}
                                  label={`${m.muscle.shortname}: ${fatigue.toFixed(2)}`}
                                  size="small"
                                  color={
                                    fatigue > 0.7
                                      ? "error"
                                      : fatigue > 0.4
                                        ? "warning"
                                        : "success"
                                  }
                                  sx={{
                                    fontSize: "0.7rem",
                                    height: 22,
                                    bgcolor: isDark
                                      ? fatigue > 0.7
                                        ? "error.dark"
                                        : fatigue > 0.4
                                          ? "warning.dark"
                                          : "success.dark"
                                      : undefined,
                                  }}
                                />
                              );
                            })
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {formatDataTimeISO(ex.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(ex)}
                          disabled={isDeleting && selected?.id === ex.id}
                          title="O‘chirish"
                          sx={{
                            bgcolor: isDark ? "error.dark" : "error.light",
                            color: "background.default",
                            "&:hover": {
                              bgcolor: "error.main",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
