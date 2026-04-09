import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { todoListApi, type TodoList } from "../services/api";
import { getCurrentUserId } from "../utils/auth";

export default function AllTodoLists() {
  const navigate = useNavigate();
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<"updatedAt" | "createdAt" | "name">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
  );

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info"
  });

  useEffect(() => {
    loadTodoLists();
  }, []);

  const loadTodoLists = async () => {
    setIsLoading(true);
    try {
      const lists = await todoListApi.getByUser(getCurrentUserId());
      setTodoLists(lists);
    } catch (error) {
      console.error("Failed to load todo lists:", error);
      showSnackbar("Failed to load todo lists", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error" | "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenDialog = () => {
    setNewListName("");
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleGenerateList = async () => {
    if (!newListName || !startDate || !endDate) {
      showSnackbar("Please fill in all fields", "error");
      return;
    }

    if (startDate > endDate) {
      showSnackbar("Start date must be before end date", "error");
      return;
    }

    setIsGenerating(true);
    try {
      // Format dates as YYYY-MM-DDTHH:mm:ss in local timezone to avoid timezone conversion issues
      // The backend will handle making the end date exclusive
      const formatLocalDateTime = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00`;
      };
      
      const startDateLocal = new Date(startDate);
      startDateLocal.setHours(0, 0, 0, 0);
      const endDateLocal = new Date(endDate);
      endDateLocal.setHours(0, 0, 0, 0);
      
      const newList = await todoListApi.generate({
        userId: getCurrentUserId(),
        name: newListName,
        startDate: formatLocalDateTime(startDateLocal),
        endDate: formatLocalDateTime(endDateLocal)
      });

      setTodoLists(prev => [newList, ...prev]);
      handleCloseDialog();
      showSnackbar("Todo list generated successfully!", "success");

      // Navigate to the new list
      navigate(`/lists/${newList.listId}`);
    } catch (error) {
      console.error("Failed to generate todo list:", error);
      showSnackbar("Failed to generate todo list", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteList = async (listId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (!confirm("Are you sure you want to delete this todo list?")) {
      return;
    }

    try {
      await todoListApi.delete(listId);
      setTodoLists(prev => prev.filter(list => list.listId !== listId));
      showSnackbar("Todo list deleted", "success");
    } catch (error) {
      console.error("Failed to delete todo list:", error);
      showSnackbar("Failed to delete todo list", "error");
    }
  };

  // Filter and sort lists
  const filteredAndSortedLists = todoLists
    .filter(list => 
      list.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case "updatedAt":
        default:
          comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ bgcolor: "#0f172a", minHeight: "100vh", color: "white" }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mb={4}
          >
            <Typography 
              variant="h4" 
              fontWeight={700}
              sx={{
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Todo Lists
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"
                },
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Generate New List
            </Button>
          </Stack>

          {/* Search and Sort Controls */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mb={4}
          >
            <TextField
              size="small"
              label="Search lists"
              placeholder="Search lists…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#475569" },
                  "&:hover fieldset": { borderColor: "#60a5fa" },
                  "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" }
              }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: "#94a3b8" }}>Sort by</InputLabel>
              <Select
                label="Sort by"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#60a5fa" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" }
                }}
              >
                <MenuItem value="updatedAt">Last updated</MenuItem>
                <MenuItem value="createdAt">Date created</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: "#94a3b8" }}>Order</InputLabel>
              <Select
                label="Order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#60a5fa" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" }
                }}
              >
                <MenuItem value="desc">Desc</MenuItem>
                <MenuItem value="asc">Asc</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Todo Lists Grid */}
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#60a5fa" }} />
            </Box>
          ) : filteredAndSortedLists.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "#94a3b8"
              }}
            >
              <Typography variant="h6" mb={2}>
                No todo lists yet
              </Typography>
              <Typography variant="body2" mb={3}>
                Generate your first todo list from your calendar events
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{
                  borderColor: "#60a5fa",
                  color: "#60a5fa",
                  "&:hover": {
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)"
                  }
                }}
              >
                Generate
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)"
                },
                gap: 3
              }}
            >
              {filteredAndSortedLists.map((list) => (
                <Box key={list.listId}>
                  <Card
                    sx={{
                      background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                      borderRadius: 3,
                      border: "1px solid #475569",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 40px rgba(59, 130, 246, 0.2)",
                        borderColor: "#60a5fa"
                      }
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate(`/lists/${list.listId}`)}
                      sx={{ p: 0 }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ color: "white", mb: 2 }}
                            noWrap
                          >
                            {list.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleDeleteList(list.listId!, e)}
                            sx={{
                              color: "#94a3b8",
                              "&:hover": { color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)" }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                          <Chip
                            label={`${formatDate(list.startDate)} - ${formatDate(list.endDate)}`}
                            size="small"
                            sx={{
                              bgcolor: "rgba(59, 130, 246, 0.2)",
                              color: "#60a5fa",
                              fontSize: "0.75rem"
                            }}
                          />
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                            {list.completedItems || 0} / {list.totalItems || 0} completed
                          </Typography>
                          <Box
                            sx={{
                              width: 60,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: "#475569",
                              overflow: "hidden"
                            }}
                          >
                            <Box
                              sx={{
                                width: `${list.totalItems ? ((list.completedItems || 0) / list.totalItems) * 100 : 0}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)",
                                borderRadius: 3,
                                transition: "width 0.3s ease"
                              }}
                            />
                          </Box>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Container>

        {/* Generate List Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "white",
              color: "#1e293b",
              borderRadius: 3
            }
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              fontWeight: 700,
              color: "white"
            }}
          >
            Generate Todo List
          </DialogTitle>
          <DialogContent sx={{ pt: 3, mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                label="List Name"
                fullWidth
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Weekly Tasks, Project Sprint"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#1e293b",
                    "& fieldset": { borderColor: "#cbd5e1" },
                    "&:hover fieldset": { borderColor: "#60a5fa" },
                    "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                  },
                  "& .MuiInputLabel-root": { color: "#64748b" }
                }}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          color: "#1e293b",
                          "& fieldset": { borderColor: "#cbd5e1" },
                          "&:hover fieldset": { borderColor: "#60a5fa" },
                          "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                        },
                        "& .MuiInputLabel-root": { color: "#64748b" }
                      }
                    }
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          color: "#1e293b",
                          "& fieldset": { borderColor: "#cbd5e1" },
                          "&:hover fieldset": { borderColor: "#60a5fa" },
                          "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                        },
                        "& .MuiInputLabel-root": { color: "#64748b" }
                      }
                    }
                  }}
                />
              </Stack>

            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{ color: "#64748b" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateList}
              variant="contained"
              disabled={isGenerating}
              startIcon={isGenerating ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{
                background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"
                },
                "&:disabled": {
                  background: "#475569"
                }
              }}
            >
              {isGenerating ? "Generating..." : "Generate List"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}
