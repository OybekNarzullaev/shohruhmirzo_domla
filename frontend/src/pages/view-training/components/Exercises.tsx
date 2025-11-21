import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import DeleteIcon from "@mui/icons-material/Delete";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  useTheme,
  TablePagination,
  Paper,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { useNotifications } from "@toolpad/core/useNotifications";
import { deleteExerciseAPI, listExercisesAPI } from "../../../api/exercise";
import type { Exercise } from "../../../types/Core";
import { formatDataTimeISO } from "../../../utils/funtions";

export const Exercises = () => {
  const { trainingId } = useParams<{ trainingId: string }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const notifications = useNotifications();

  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<Exercise | null>(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // backend default

  // === 1. Mashqlar (pagination bilan) ===
  const {
    data: response,
    isFetching: isFetchingExercises,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["training-exercises", trainingId, page, rowsPerPage],
    queryFn: () =>
      listExercisesAPI(trainingId as any, {
        page: page + 1,
        page_size: rowsPerPage,
      }),
    enabled: !!trainingId,
    refetchOnWindowFocus: false,
  });

  const exercises = response?.results || [];
  const totalCount = response?.count || 0;

  const isLoading = isFetchingExercises;

  // === 2. O‘chirish ===
  const { mutateAsync: remove, isPending: isDeleting } = useMutation({
    mutationFn: (exerciseId: number) => deleteExerciseAPI(exerciseId),
    onSuccess: () => {
      refetch();
      notifications.show("Mashq muvaffaqiyatli o‘chirildi", {
        severity: "success",
      });
    },
    onError: () => {
      notifications.show("O‘chirishda xatolik yuz berdi", {
        severity: "error",
      });
    },
  });

  const handleDelete = async (exercise: Exercise) => {
    if (!window.confirm("Bu mashqni o‘chirishni xohlaysizmi?")) return;
    setSelected(exercise);
    await remove(exercise.id!);
    setSelected(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  // === 3. Ranglar ===
  const bgColor = isDark ? "grey.900" : "background.paper";
  const borderColor = isDark ? "grey.700" : "grey.300";
  const hoverBg = theme.palette.action.hover;
  const textSecondary = theme.palette.text.secondary;

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      sx={{
        borderRadius: 2,
        bgcolor: bgColor,
        boxShadow: isDark ? 4 : 3,
        border: `1px solid ${borderColor}`,
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: "background.default" }} />}
        sx={{
          bgcolor: "primary.main",
          color: "background.default",
          borderRadius: expanded ? "8px 8px 0 0" : 2,
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
              Mashqlar {totalCount > 0 && `(${totalCount})`}
            </Typography>
          </Stack>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
        {isLoading ? (
          <Stack spacing={1}>
            {[...Array(Math.min(rowsPerPage, 5))].map((_, i) => (
              <Skeleton
                key={i}
                height={56}
                sx={{ bgcolor: isDark ? "grey.800" : "grey.200" }}
              />
            ))}
          </Stack>
        ) : isError ? (
          <Box sx={{ py: 6, textAlign: "center", color: "error.main" }}>
            <Typography variant="h6">Ma'lumotlarni yuklab bo‘lmadi</Typography>
          </Box>
        ) : exercises.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="h6">Mashqlar mavjud emas</Typography>
            <Typography variant="body2" mt={1}>
              Yangi mashq qo‘shish uchun grafikdan diapazon tanlang.
            </Typography>
          </Box>
        ) : (
          <Paper sx={{ overflow: "hidden" }}>
            <TableContainer>
              <Table stickyHeader size="small">
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
                      <TableCell>{page * rowsPerPage + i + 1}</TableCell>
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
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={ex.description || ""}>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 160,
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
                            ex.muscles.map((m: any) => (
                              <Chip
                                key={m.id}
                                label={`${m.muscle.shortname}: ${Number(m.fatigue).toFixed(2)}`}
                                size="small"
                                color={
                                  m.fatigue > 0.7
                                    ? "error"
                                    : m.fatigue > 0.4
                                      ? "warning"
                                      : "success"
                                }
                                sx={{ fontSize: "0.7rem", height: 22 }}
                              />
                            ))
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
                        >
                          {isDeleting && selected?.id === ex.id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <DeleteIcon fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Sahifada:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} / ${count !== -1 ? count : to}`
              }
              sx={{
                borderTop: `1px solid ${borderColor}`,
                bgcolor: isDark ? "grey.800" : "grey.50",
              }}
            />
          </Paper>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
