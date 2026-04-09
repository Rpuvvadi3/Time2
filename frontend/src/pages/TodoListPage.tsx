import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Collapse from "@mui/material/Collapse";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FlagIcon from "@mui/icons-material/Flag";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventIcon from "@mui/icons-material/Event";

import { todoListApi, type TodoList, type TodoItem } from "../services/api";

export default function TodoListPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  
  const [todoList, setTodoList] = useState<TodoList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  
  // Dialog states
  const [addItemDialog, setAddItemDialog] = useState(false);
  const [editTitleDialog, setEditTitleDialog] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPriority, setNewItemPriority] = useState<string>("medium");
  const [editedTitle, setEditedTitle] = useState("");

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info"
  });

  useEffect(() => {
    if (listId) {
      loadTodoList(parseInt(listId));
    }
  }, [listId]);

  const loadTodoList = async (id: number) => {
    setIsLoading(true);
    try {
      const list = await todoListApi.getById(id);
      setTodoList(list);
      setEditedTitle(list.name);
    } catch (error) {
      console.error("Failed to load todo list:", error);
      showSnackbar("Failed to load todo list", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error" | "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleToggleComplete = async (item: TodoItem) => {
    if (!item.itemId) return;
    
    try {
      const updatedItem = await todoListApi.updateItemCompletion(item.itemId, !item.completed);
      setTodoList(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items?.map(i => 
            i.itemId === item.itemId ? updatedItem : i
          ),
          completedItems: prev.items?.filter(i => 
            i.itemId === item.itemId ? updatedItem.completed : i.completed
          ).length || 0
        };
      });
      showSnackbar(updatedItem.completed ? "Task completed!" : "Task marked incomplete", "success");
    } catch (error) {
      console.error("Failed to update item:", error);
      showSnackbar("Failed to update task", "error");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await todoListApi.deleteItem(itemId);
      setTodoList(prev => {
        if (!prev) return prev;
        const newItems = prev.items?.filter(i => i.itemId !== itemId) || [];
        return {
          ...prev,
          items: newItems,
          totalItems: newItems.length,
          completedItems: newItems.filter(i => i.completed).length
        };
      });
      showSnackbar("Task deleted", "success");
    } catch (error) {
      console.error("Failed to delete item:", error);
      showSnackbar("Failed to delete task", "error");
    }
  };

  const handleAddItem = async () => {
    if (!todoList?.listId || !newItemTitle.trim()) return;
    
    try {
      const newItem = await todoListApi.addItem(todoList.listId, {
        title: newItemTitle,
        description: newItemDescription,
        priority: newItemPriority as 'low' | 'medium' | 'high',
        completed: false
      });
      
      setTodoList(prev => {
        if (!prev) return prev;
        const newItems = [...(prev.items || []), newItem];
        return {
          ...prev,
          items: newItems,
          totalItems: newItems.length
        };
      });
      
      setAddItemDialog(false);
      setNewItemTitle("");
      setNewItemDescription("");
      setNewItemPriority("medium");
      showSnackbar("Task added", "success");
    } catch (error) {
      console.error("Failed to add item:", error);
      showSnackbar("Failed to add task", "error");
    }
  };

  const handleUpdateTitle = async () => {
    if (!todoList?.listId || !editedTitle.trim()) return;
    
    try {
      const updatedList = await todoListApi.update(todoList.listId, editedTitle);
      setTodoList(prev => prev ? { ...prev, name: updatedList.name } : prev);
      setEditTitleDialog(false);
      showSnackbar("List name updated", "success");
    } catch (error) {
      console.error("Failed to update list:", error);
      showSnackbar("Failed to update list name", "error");
    }
  };

  const toggleExpanded = (itemId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority?.toLowerCase()) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#22c55e";
      default: return "#94a3b8";
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const completedCount = todoList?.items?.filter(i => i.completed).length || 0;
  const totalCount = todoList?.items?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100%",
        bgcolor: "#0f172a"
      }}>
        <CircularProgress sx={{ color: "#60a5fa" }} />
      </Box>
    );
  }

  if (!todoList) {
    return (
      <Box sx={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100%",
        bgcolor: "#0f172a",
        color: "white"
      }}>
        <Typography variant="h5" mb={2}>Todo list not found</Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate("/todoboard")}
          sx={{ color: "#60a5fa", borderColor: "#60a5fa" }}
        >
          Back to Lists
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#0f172a", color: "white", minHeight: "100%" }}>
      <Container 
        maxWidth="md" 
        sx={{ 
          py: 4, 
          pb: 6,
          bgcolor: "#0f172a",
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <IconButton 
            onClick={() => navigate("/todoboard")}
            sx={{ color: "#94a3b8", "&:hover": { color: "#60a5fa" } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={2}>
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
                {todoList.name}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setEditTitleDialog(true)}
                sx={{ color: "#94a3b8", "&:hover": { color: "#60a5fa" } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1 }}>
              {new Date(todoList.startDate).toLocaleDateString()} - {new Date(todoList.endDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>

        {/* Progress Section */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            bgcolor: "#1e293b",
            border: "1px solid #334155"
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600} sx={{ color: "white" }}>
              Progress
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              {completedCount} of {totalCount} tasks completed
            </Typography>
          </Stack>
          <Box sx={{ position: "relative" }}>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: "#334155",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 6,
                  background: progressPercent === 100
                    ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
                    : "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)"
                }
              }}
            />
          </Box>
          {progressPercent === 100 && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#22c55e", 
                mt: 2, 
                textAlign: "center",
                fontWeight: 600 
              }}
            >
              🎉 All tasks completed! Great job!
            </Typography>
          )}
        </Paper>

        {/* Add Task Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setAddItemDialog(true)}
          sx={{
            mb: 3,
            py: 1.5,
            borderColor: "#475569",
            color: "#94a3b8",
            borderStyle: "dashed",
            "&:hover": {
              borderColor: "#60a5fa",
              color: "#60a5fa",
              bgcolor: "rgba(96, 165, 250, 0.1)"
            }
          }}
        >
          Add New Task
        </Button>

        {/* Tasks List */}
        <Stack spacing={2}>
          {todoList.items?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map((item) => (
            <Paper
              key={item.itemId}
              sx={{
                borderRadius: 2,
                bgcolor: item.completed ? "#1a2332" : "#1e293b",
                border: "1px solid",
                borderColor: item.completed ? "#334155" : "#475569",
                overflow: "hidden",
                transition: "all 0.2s ease",
                opacity: item.completed ? 0.7 : 1,
                "&:hover": {
                  borderColor: "#60a5fa"
                }
              }}
            >
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={2}
                sx={{ p: 2 }}
              >
                <Checkbox
                  checked={item.completed}
                  onChange={() => handleToggleComplete(item)}
                  sx={{
                    color: "#475569",
                    "&.Mui-checked": {
                      color: "#22c55e"
                    }
                  }}
                />
                
                <Box flex={1}>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      textDecoration: item.completed ? "line-through" : "none",
                      color: item.completed ? "#64748b" : "white"
                    }}
                  >
                    {item.title}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} mt={1} alignItems="center">
                    {item.isTask === true && (
                      <Chip
                        icon={<AssignmentIcon sx={{ fontSize: 14, color: "#22c55e !important" }} />}
                        label="Task"
                        size="small"
                        sx={{
                          bgcolor: "rgba(34, 197, 94, 0.2)",
                          color: "#22c55e",
                          fontSize: "0.7rem",
                          height: 24,
                          fontWeight: 500
                        }}
                      />
                    )}
                    {item.isTask === false && (
                      <Chip
                        icon={<EventIcon sx={{ fontSize: 14, color: "#8b5cf6 !important" }} />}
                        label="Event"
                        size="small"
                        sx={{
                          bgcolor: "rgba(139, 92, 246, 0.2)",
                          color: "#8b5cf6",
                          fontSize: "0.7rem",
                          height: 24,
                          fontWeight: 500
                        }}
                      />
                    )}
                    {item.priority && (
                      <Chip
                        icon={<FlagIcon sx={{ fontSize: 14, color: `${getPriorityColor(item.priority)} !important` }} />}
                        label={item.priority}
                        size="small"
                        sx={{
                          bgcolor: `${getPriorityColor(item.priority)}20`,
                          color: getPriorityColor(item.priority),
                          fontSize: "0.7rem",
                          height: 24
                        }}
                      />
                    )}
                    {item.scheduledStart && item.isTask === false && (
                      <Chip
                        icon={<AccessTimeIcon sx={{ fontSize: 14, color: "#60a5fa !important" }} />}
                        label={formatDateTime(item.scheduledStart)}
                        size="small"
                        sx={{
                          bgcolor: "rgba(96, 165, 250, 0.1)",
                          color: "#60a5fa",
                          fontSize: "0.7rem",
                          height: 24
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1}>
                  {item.description && (
                    <Tooltip title={expandedItems.has(item.itemId!) ? "Collapse" : "Expand"}>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpanded(item.itemId!)}
                        sx={{ color: "#94a3b8" }}
                      >
                        {expandedItems.has(item.itemId!) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteItem(item.itemId!)}
                    sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Collapse 
                in={expandedItems.has(item.itemId!)}
                sx={{
                  bgcolor: item.completed ? "#1a2332" : "#1e293b",
                }}
              >
                <Box sx={{ 
                  px: 2, 
                  pb: 2, 
                  pt: 0, 
                  ml: 6,
                  bgcolor: item.completed ? "#1a2332" : "#1e293b",
                }}>
                  {item.description && (
                    <Typography variant="body2" sx={{ color: "#94a3b8", mb: 1 }}>
                      {item.description}
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Stack>

        {(!todoList.items || todoList.items.length === 0) && (
          <Box sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>
            <Typography variant="h6" mb={2}>
              No tasks yet
            </Typography>
            <Typography variant="body2">
              Add your first task to get started
            </Typography>
          </Box>
        )}
      </Container>

      {/* Add Item Dialog */}
      <Dialog
        open={addItemDialog}
        onClose={() => setAddItemDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1e293b", color: "white", borderRadius: 3 }
        }}
        BackdropProps={{
          sx: { bgcolor: "rgba(0, 0, 0, 0.7)" }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#475569" },
                  "&:hover fieldset": { borderColor: "#60a5fa" }
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" }
              }}
            />
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={3}
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#475569" },
                  "&:hover fieldset": { borderColor: "#60a5fa" }
                },
                "& .MuiInputLabel-root": { color: "#94a3b8" }
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#94a3b8" }}>Priority</InputLabel>
              <Select
                value={newItemPriority}
                label="Priority"
                onChange={(e) => setNewItemPriority(e.target.value)}
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#475569" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#60a5fa" }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#1e293b",
                      color: "white",
                      "& .MuiMenuItem-root": {
                        color: "white",
                        "&:hover": {
                          bgcolor: "#334155"
                        },
                        "&.Mui-selected": {
                          bgcolor: "#475569",
                          "&:hover": {
                            bgcolor: "#475569"
                          }
                        }
                      }
                    }
                  }
                }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAddItemDialog(false)} sx={{ color: "#94a3b8" }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
            }}
          >
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Title Dialog */}
      <Dialog
        open={editTitleDialog}
        onClose={() => setEditTitleDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: "#1e293b", color: "white", borderRadius: 3 }
        }}
        BackdropProps={{
          sx: { bgcolor: "rgba(0, 0, 0, 0.7)" }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit List Name</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            sx={{
              mt: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "#475569" },
                "&:hover fieldset": { borderColor: "#60a5fa" }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditTitleDialog(false)} sx={{ color: "#94a3b8" }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateTitle}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
