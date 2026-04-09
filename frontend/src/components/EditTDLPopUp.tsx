import React, { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";

export interface ToDoLite {
  id: string;
  name: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

interface EditTDLPopUpProps {
  open: boolean;
  onClose: () => void;
  item: ToDoLite | null; // pass the list to edit
  onSaved: (updated: ToDoLite) => void; // parent persists (e.g., state/localStorage)
}

const EditTDLPopUp: React.FC<EditTDLPopUpProps> = ({ open, onClose, item, onSaved }) => {
  const [name, setName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Load selected item into local form state
  useEffect(() => {
    if (open && item) {
      setName(item.name || "");
      setStartDate(item.startDate ? new Date(item.startDate) : null);
      setEndDate(item.endDate ? new Date(item.endDate) : null);
    }
  }, [open, item]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!item || !name || !startDate || !endDate) {
      alert("Please fill out all fields.");
      return;
    }

    onSaved({
      id: item.id,
      name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          fontWeight: 700,
          textAlign: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        Edit To-Do List
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="To-Do List Name"
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 3 }}
            />

            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slots={{ openPickerIcon: CalendarTodayIcon }}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 3 } } }}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slots={{ openPickerIcon: CalendarTodayIcon }}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 4 } } }}
            />

            <DialogActions sx={{ justifyContent: "center", gap: 2 }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6",
                  "&:hover": { backgroundColor: "#2563eb" },
                  fontWeight: 700,
                  px: 4,
                }}
              >
                Save
              </Button>
            </DialogActions>
          </form>
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};

export default EditTDLPopUp;
