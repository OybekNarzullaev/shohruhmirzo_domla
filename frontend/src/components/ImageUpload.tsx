import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  Stack,
} from "@mui/material";

export function ImageUpload({
  value,
  onChange,
  error,
  accept = ".png,.jpg",
}: {
  value: File;
  accept?: string;
  onChange: (value: File[]) => void | Promise<void>;
  error: string | null;
}) {
  const inputId = "profile-picture";
  const labelId = "profile-picture-label";
  const label = "Profil rasmi";

  const handleChange = (event: any) => {
    const file: File = event.target.files?.[0];
    const filename = file?.name;
    console.log(file);

    const label = document.getElementById(labelId);
    if (filename && label) {
      label.innerHTML = filename;
    } else if (label) {
      label.innerHTML = "Rasm tanlang";
    }
    onChange(file as any);
  };

  const clear = () => {
    const label = document.getElementById(labelId);
    if (label) {
      label.innerHTML = "Rasm tanlang";
    }
    const input: any = document.getElementById(inputId);
    if (input) {
      input.value = null;
    }
    onChange(null as any);
  };

  return (
    <FormControl error={!!error} fullWidth>
      {value && (
        <Box position={"relative"} height={100} width={100}>
          <Box
            height={100}
            width={100}
            component={"img"}
            sx={{
              objectFit: "contain",
            }}
            src={typeof value === "string" ? value : URL.createObjectURL(value)}
          ></Box>
          <IconButton
            size="small"
            sx={{
              borderRadius: 1,
              position: "absolute",
              top: -10,
              right: -10,
              color: "white",
              bgcolor: "warning.main",
              "&:hover": {
                bgcolor: "warning.light",
              },
            }}
            onClick={clear}
            type="button"
          >
            <ClearIcon />
          </IconButton>
        </Box>
      )}
      <Box
        component={"label"}
        sx={{ color: error ? "error.main" : "primary.main" }}
        htmlFor={inputId}
        id={labelId}
      >
        Rasm tanlang
      </Box>
      <input
        onChange={handleChange}
        id={inputId}
        type="file"
        style={{ display: "none" }}
        accept={accept}
      />

      <Stack direction={"row"}>
        <Button
          onClick={() => {
            const input = document.getElementById(inputId);
            console.log(input);
            input?.click();
          }}
          color={error ? "error" : "primary"}
          startIcon={<CloudUploadIcon />}
          variant="outlined"
          fullWidth
          type="button"
        >
          {label}
        </Button>
      </Stack>
      <FormHelperText>{error ?? " "}</FormHelperText>
    </FormControl>
  );
}
