import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import CakeIcon from "@mui/icons-material/Cake";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import UpdateIcon from "@mui/icons-material/Update";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { getAthleteAPI } from "@/api/athletes";
import React, { useState } from "react";
import { formatDataTimeISO } from "@/utils/funtions";

export const Common = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [expanded, setExpanded] = useState(true);

  const { data: athlete, isFetching } = useQuery({
    queryKey: ["athlete", id],
    queryFn: () => getAthleteAPI(id as any),
    enabled: !!id,
  });

  const isLoading = isFetching || !athlete;

  // Dark mode uchun dinamik ranglar
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
        transition: "all 0.3s ease",
      }}
    >
      {/* Sarlavha */}
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
        <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
        <Typography variant="h6" fontWeight="medium">
          Umumiy ma'lumotlar
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Loading */}
        {isLoading ? (
          <Stack spacing={3}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Skeleton
                variant="circular"
                width={140}
                height={140}
                sx={{ bgcolor: isDark ? "grey.800" : "grey.300" }}
              />
              <Stack spacing={1.5} flex={1}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    height={32}
                    width="80%"
                    sx={{ bgcolor: isDark ? "grey.800" : "grey.200" }}
                  />
                ))}
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <>
            {/* Rasm + Ma'lumotlar */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 2, md: 4 }}
              alignItems={{ xs: "center", md: "flex-start" }}
            >
              {/* Avatar */}
              <Box
                sx={{
                  position: "relative",
                  width: { xs: 140, sm: 160, md: 180 },
                  height: { xs: 140, sm: 160, md: 180 },
                  flexShrink: 0,
                }}
              >
                <Avatar
                  src={athlete?.picture as string}
                  alt={athlete?.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: 4,
                    borderColor: borderColor,
                    boxShadow: isDark ? 3 : 2,
                    objectFit: "cover",
                    bgcolor: isDark ? "grey.800" : "grey.200",
                  }}
                >
                  <PersonIcon sx={{ fontSize: 60, color: textSecondary }} />
                </Avatar>

                {/* Daraja chip */}
                {athlete?.level && (
                  <Chip
                    icon={<EmojiEventsIcon />}
                    label={athlete.level.name}
                    size="small"
                    color="primary"
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontWeight: "bold",
                      bgcolor: isDark ? "grey.800" : "background.paper",
                      color: isDark ? "primary.light" : "primary.main",
                      border: `1px solid ${theme.palette.primary.main}`,
                      boxShadow: 1,
                    }}
                  />
                )}
              </Box>

              {/* Jadval */}
              <Box flex={1} minWidth={0}>
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  <TableBody>
                    {[
                      {
                        icon: <PersonIcon fontSize="small" />,
                        label: "F.I.Sh",
                        value: athlete?.name || "—",
                      },
                      {
                        icon: <EmojiEventsIcon fontSize="small" />,
                        label: "Darajasi",
                        value: athlete?.level?.name || "—",
                      },
                      {
                        icon: <CakeIcon fontSize="small" />,
                        label: "Tug'ilgan yili",
                        value: athlete?.birth_year || "—",
                      },
                      {
                        icon: <CalendarTodayIcon fontSize="small" />,
                        label: "Ro'yhatga olingan",
                        value: formatDataTimeISO(athlete?.created_at),
                      },
                      {
                        icon: <UpdateIcon fontSize="small" />,
                        label: "Oxirgi tahrir",
                        value: formatDataTimeISO(athlete?.updated_at),
                      },
                    ].map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": { bgcolor: hoverBg },
                          transition: "background 0.2s",
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: "medium",
                            // color: textSecondary,
                            width: 160,
                            pl: 0,
                            py: 1.2,
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            {React.cloneElement(row.icon, {
                              sx: { fontSize: 18 },
                            })}
                            <Typography variant="body2" fontWeight="medium">
                              {row.label}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "500",
                            // color: theme.palette.text.primary,
                            wordBreak: "break-word",
                            py: 1.2,
                          }}
                        >
                          <Typography variant="body2">{row.value}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Stack>

            <Divider sx={{ my: 3, borderColor: borderColor }} />

            {/* Tugma */}
            <Stack direction="row" justifyContent="flex-end">
              <Button
                component={Link}
                to={`/athletes/${athlete?.id}/edit`}
                variant="contained"
                startIcon={<EditIcon />}
              >
                Tahrirlash
              </Button>
            </Stack>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
