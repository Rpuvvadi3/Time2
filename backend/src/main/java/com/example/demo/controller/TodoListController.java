package com.example.demo.controller;

import com.example.demo.dto.TodoItemDTO;
import com.example.demo.dto.TodoListCreateDTO;
import com.example.demo.dto.TodoListResponseDTO;
import com.example.demo.entity.CalendarEvent;
import com.example.demo.entity.TodoItem;
import com.example.demo.entity.TodoList;
import com.example.demo.service.TodoListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/todolists")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TodoListController {

    private final TodoListService todoListService;

    @Autowired
    public TodoListController(TodoListService todoListService) {
        this.todoListService = todoListService;
    }

    /**
     * Generate a new todo list from calendar events within a date range
     * Optionally uses AI to optimally schedule tasks
     */
    @PostMapping("/generate")
    public ResponseEntity<TodoListResponseDTO> generateTodoList(@RequestBody TodoListCreateDTO createDTO) {
        TodoList todoList = todoListService.generateTodoList(createDTO);
        return ResponseEntity.ok(TodoListResponseDTO.fromEntity(todoList));
    }

    /**
     * Get all todo lists for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TodoListResponseDTO>> getUserTodoLists(@PathVariable Long userId) {
        List<TodoList> todoLists = todoListService.getUserTodoLists(userId);
        List<TodoListResponseDTO> response = todoLists.stream()
                .map(TodoListResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific todo list with all items
     */
    @GetMapping("/{listId}")
    public ResponseEntity<TodoListResponseDTO> getTodoList(@PathVariable Long listId) {
        return todoListService.getTodoListById(listId)
                .map(todoList -> ResponseEntity.ok(TodoListResponseDTO.fromEntity(todoList)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update a todo list's name
     */
    @PutMapping("/{listId}")
    public ResponseEntity<TodoListResponseDTO> updateTodoList(
            @PathVariable Long listId,
            @RequestBody UpdateListRequest request) {
        TodoList todoList = todoListService.updateTodoList(listId, request.getName());
        return ResponseEntity.ok(TodoListResponseDTO.fromEntity(todoList));
    }

    /**
     * Delete a todo list
     */
    @DeleteMapping("/{listId}")
    public ResponseEntity<Void> deleteTodoList(@PathVariable Long listId) {
        todoListService.deleteTodoList(listId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Add a new item to a todo list
     */
    @PostMapping("/{listId}/items")
    public ResponseEntity<TodoItemDTO> addItem(
            @PathVariable Long listId,
            @RequestBody TodoItemDTO itemDTO) {
        TodoItem item = todoListService.addItemToList(
                listId,
                itemDTO.getTitle(),
                itemDTO.getDescription(),
                itemDTO.getPriority(),
                itemDTO.getScheduledStart(),
                itemDTO.getScheduledEnd()
        );
        return ResponseEntity.ok(convertItemToDTO(item));
    }

    /**
     * Update a todo item's completion status
     */
    @PatchMapping("/items/{itemId}/complete")
    public ResponseEntity<TodoItemDTO> updateItemCompletion(
            @PathVariable Long itemId,
            @RequestBody UpdateCompletionRequest request) {
        TodoItem item = todoListService.updateTodoItem(itemId, request.isCompleted());
        return ResponseEntity.ok(convertItemToDTO(item));
    }

    /**
     * Update a todo item's details
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<TodoItemDTO> updateItemDetails(
            @PathVariable Long itemId,
            @RequestBody TodoItemDTO itemDTO) {
        TodoItem item = todoListService.updateTodoItemDetails(
                itemId,
                itemDTO.getTitle(),
                itemDTO.getDescription(),
                itemDTO.getPriority(),
                itemDTO.getScheduledStart(),
                itemDTO.getScheduledEnd()
        );
        return ResponseEntity.ok(convertItemToDTO(item));
    }

    /**
     * Delete a todo item
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        todoListService.deleteTodoItem(itemId);
        return ResponseEntity.noContent().build();
    }

    private TodoItemDTO convertItemToDTO(TodoItem item) {
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

    // Request DTOs
    public static class UpdateListRequest {
        private String name;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class UpdateCompletionRequest {
        private boolean completed;
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }
}


