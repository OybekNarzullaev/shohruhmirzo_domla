import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type React from "react";
import { Link } from "react-router";

interface Props {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: {
    path?: string;
    title: string;
  }[];
}
export const PageContainer = ({ title, children, breadcrumbs }: Props) => {
  return (
    <Stack
      maxHeight={"100%"}
      height={"100%"}
      overflow={"auto"}
      p={{
        xl: 4,
        lg: 4,
        md: 3,
        sm: 2,
        xs: 1,
      }}
    >
      <Box mb={2}>
        <Typography variant="h4" fontWeight={600}>
          {title}
        </Typography>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          {breadcrumbs?.map((b, i) =>
            b.path ? (
              <Link key={i} color="inherit" to={b.path}>
                <Typography color="textPrimary">{b.title}</Typography>
              </Link>
            ) : (
              <Typography key={i}>{b.title}</Typography>
            )
          )}
        </Breadcrumbs>
      </Box>
      <Box flex={1}>{children}</Box>
    </Stack>
  );
};
