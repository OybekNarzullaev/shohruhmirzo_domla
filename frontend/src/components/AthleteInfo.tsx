import type { Athlete } from "@/types/Athelete";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

interface Props {
  athlete: Athlete;
}
export const AthleteInfo = ({ athlete }: Props) => {
  const theme = useTheme();
  return (
    <Stack component={Paper} variant="outlined" boxShadow={1} p={2} gap={5}>
      <Stack flex={1} p={2} alignItems={"center"} gap={2}>
        <Avatar
          alt="ON"
          src={athlete.profile_pic}
          sx={{
            width: 96,
            height: 96,
            bgcolor: theme.palette.primary.main,
          }}
        />
        <Typography variant="h6" fontWeight={600}>
          {athlete.fullname}
        </Typography>
      </Stack>
      <Stack flex={1} gap={1}>
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography fontWeight={600}>ID</Typography>
          <Typography>#{athlete.id}</Typography>
        </Stack>
        <Divider />
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography fontWeight={600}>F.I.O</Typography>
          <Typography>{athlete.fullname}</Typography>
        </Stack>
        <Divider />
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography fontWeight={600}>Bo'yi</Typography>
          <Typography>{athlete.height}</Typography>
        </Stack>
        <Divider />
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography fontWeight={600}>Vazni</Typography>
          <Typography>{athlete.weight}</Typography>
        </Stack>
        <Divider />
        <Stack flexDirection={"row"} justifyContent={"space-between"}>
          <Typography fontWeight={600}>Tug'ilgan yili</Typography>
          <Typography>{athlete.year_of_birth}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
