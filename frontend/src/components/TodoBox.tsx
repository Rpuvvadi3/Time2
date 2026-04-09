import { Checkbox, TextField, IconButton, Box } from "@mui/material";
import {Delete as DeleteIcon} from "@mui/icons-material/";
import { useState } from "react";

interface TodoBoxProps {
  text: string;
  onDelete?: () => void;
}

export default function TodoBox({ text, onDelete }: TodoBoxProps) {
  const [checked, setChecked] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1,
        borderRadius: 2,
        bgcolor: checked ? "grey.200" : "background.paper",
        transition: "0.2s",
      }}
    >
      <Checkbox checked={checked} onChange={() => setChecked(!checked)} />
      <TextField
        variant="standard"
        value={text}
        InputProps={{ disableUnderline: true }}
        sx={{
          flex: 1,
          textDecoration: checked ? "line-through" : "none",
        }}
      />
      <IconButton onClick={onDelete} color="error">
        <DeleteIcon />
      </IconButton>
    </Box>
  );
}
