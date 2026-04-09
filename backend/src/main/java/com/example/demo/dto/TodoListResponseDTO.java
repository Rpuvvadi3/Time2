package com.example.demo.dto;

import com.example.demo.entity.CalendarEvent;
import com.example.demo.entity.TodoItem;
import com.example.demo.entity.TodoList;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class TodoListResponseDTO {
    private Long listId;
    private Long userId;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TodoItemDTO> items;
    private int totalItems;
    private int completedItems;

    public static TodoListResponseDTO fromEntity(TodoList todoList) {
        TodoListResponseDTO dto = new TodoListResponseDTO();
        dto.setListId(todoList.getListId());
        dto.setUserId(todoList.getUser() != null ? todoList.getUser().getUserId() : null);
        dto.setName(todoList.getName());
        dto.setStartDate(todoList.getStartDate());
        dto.setEndDate(todoList.getEndDate());
        dto.setCreatedAt(todoList.getCreatedAt());
        dto.setUpdatedAt(todoList.getUpdatedAt());
        
        if (todoList.getItems() != null) {
            dto.setItems(todoList.getItems().stream()
                .map(TodoListResponseDTO::convertItemToDTO)
                .collect(Collectors.toList()));
            dto.setTotalItems(todoList.getItems().size());
            dto.setCompletedItems((int) todoList.getItems().stream()
                .filter(TodoItem::isCompleted).count());
        }
        
        return dto;
    }

    private static TodoItemDTO convertItemToDTO(TodoItem item) {
        TodoItemDTO dto = new TodoItemDTO();
        dto.setItemId(item.getItemId());
        dto.setListId(item.getTodoList() != null ? item.getTodoList().getListId() : null);
        
        // Safely get event and set eventId and isTask
        try {
            CalendarEvent event = item.getEvent();
            if (event != null) {
                dto.setEventId(event.getEventId());
                dto.setIsTask(event.isTask());
            } else {
                dto.setEventId(null);
                dto.setIsTask(null);
            }
        } catch (Exception e) {
            // If event is not loaded or there's an error, set to null
            dto.setEventId(null);
            dto.setIsTask(null);
        }
        
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setScheduledStart(item.getScheduledStart());
        dto.setScheduledEnd(item.getScheduledEnd());
        dto.setPriority(item.getPriority());
        dto.setCompleted(item.isCompleted());
        dto.setSortOrder(item.getSortOrder());
        return dto;
    }

    // Getters and Setters
    public Long getListId() {
        return listId;
    }

    public void setListId(Long listId) {
        this.listId = listId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<TodoItemDTO> getItems() {
        return items;
    }

    public void setItems(List<TodoItemDTO> items) {
        this.items = items;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public int getCompletedItems() {
        return completedItems;
    }

    public void setCompletedItems(int completedItems) {
        this.completedItems = completedItems;
    }
}

