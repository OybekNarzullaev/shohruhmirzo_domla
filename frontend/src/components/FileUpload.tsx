import React, { useRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface FileUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  label?: string;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  error,
  label = "Fayl yuklash",
  accept,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>

      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        onClick={handleButtonClick}
      >
        {value ? value.name : "Fayl tanlang"}
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept={accept}
        onChange={handleFileChange}
      />

      {value && (
        <Typography variant="body2" color="text.secondary">
          Tanlangan fayl: <strong>{value.name}</strong>
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
