import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid3x3Icon from "@mui/icons-material/Grid3x3";
import { PageContainer } from "@toolpad/core/PageContainer";
import { Link } from "react-router";
import { Box } from "@mui/material";

export default function HomePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <PageContainer
      sx={{
        // bgcolor: isDark ? "grey.900" : "grey.50",
        minHeight: "100%",
        display: "flex",
        alignItems: "center",

        justifyContent: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Stack
        spacing={{ xs: 3, sm: 4 }}
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        maxWidth="md"
        sx={{
          minHeight: "100%",
          animation: "fadeIn 1s ease-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0, transform: "translateY(20px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        {/* Sarlavha */}
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{
            background: isDark
              ? "linear-gradient(90deg, #4facfe, #00f2fe)"
              : "linear-gradient(90deg, #0072ff, #00c6ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "0.5px",
            lineHeight: 1.2,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          Sportchilarning biosignallarini tahlil qilish tizimi
        </Typography>

        {/* Tavsif */}
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 600,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            lineHeight: 1.6,
          }}
        >
          EMG, ECG va boshqa biosignallarni real vaqtda tahlil qiling, mashqlar
          samaradorligini oshiring va sportchilar salomatligini nazorat qiling.
        </Typography>

        {/* Tugma */}
        <Button
          component={Link}
          to="/athletes"
          variant="contained"
          size="large"
          startIcon={
            <Grid3x3Icon
              sx={{
                fontSize: 28,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.1)" },
                },
              }}
            />
          }
          sx={{
            mt: 2,
            px: { xs: 4, sm: 5 },
            py: 1.5,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            fontWeight: "medium",
            textTransform: "none",
            borderRadius: 3,
            boxShadow: isDark ? 6 : 4,
            bgcolor: "primary.main",
            "&:hover": {
              bgcolor: "primary.dark",
              boxShadow: isDark ? 10 : 8,
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Ma'lumotlarga o'tish
        </Button>

        {/* Qo‘shimcha ikonka (dekorativ) */}
        <Box
          sx={{
            mt: 4,
            opacity: 0.1,
            fontSize: 120,
            color: "primary.main",
          }}
        >
          <Grid3x3Icon sx={{ fontSize: "inherit" }} />
        </Box>
      </Stack>
    </PageContainer>
  );
}
