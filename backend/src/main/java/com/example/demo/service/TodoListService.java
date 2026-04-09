package com.example.demo.service;

import com.example.demo.dto.TodoListCreateDTO;
import com.example.demo.entity.CalendarEvent;
import com.example.demo.entity.TodoItem;
import com.example.demo.entity.TodoList;
import com.example.demo.entity.User;
import com.example.demo.repository.CalendarEventRepository;
import com.example.demo.repository.TodoItemRepository;
import com.example.demo.repository.TodoListRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TodoListService {

    private final TodoListRepository todoListRepository;
    private final TodoItemRepository todoItemRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;

    @Autowired
    public TodoListService(TodoListRepository todoListRepository,
                           TodoItemRepository todoItemRepository,
                           CalendarEventRepository calendarEventRepository,
                           UserRepository userRepository) {
        this.todoListRepository = todoListRepository;
        this.todoItemRepository = todoItemRepository;
        this.calendarEventRepository = calendarEventRepository;
        this.userRepository = userRepository;
    }

    /**
     * Generate a todo list from calendar events AND tasks within a date range
     */
    @Transactional
    public TodoList generateTodoList(TodoListCreateDTO createDTO) {
        User user = userRepository.findById(createDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch ALL items (both events AND tasks) in the date range
        // For events: use startDate at start of day and endDate at start of next day (exclusive)
        // For tasks: use startDate and endDate as LocalDate (inclusive)
        LocalDateTime startDateTime = createDTO.getStartDate().toLocalDate().atStartOfDay();
        LocalDateTime endDateTimeExclusive = createDTO.getEndDate().toLocalDate().plusDays(1).atStartOfDay();
        
        List<CalendarEvent> allItems = calendarEventRepository.findAllByUserIdAndDateRange(
                createDTO.getUserId(),
                startDateTime,
                endDateTimeExclusive,
                createDTO.getStartDate().toLocalDate(),
                createDTO.getEndDate().toLocalDate()
        );

        System.out.println("Found " + allItems.size() + " calendar items for user " + createDTO.getUserId() + 
                " between " + createDTO.getStartDate() + " and " + createDTO.getEndDate());

        // Create the todo list
        TodoList todoList = new TodoList();
        todoList.setUser(user);
        todoList.setName(createDTO.getName());
        todoList.setStartDate(createDTO.getStartDate());
        todoList.setEndDate(createDTO.getEndDate());

        // Save the list first to get the ID
        todoList = todoListRepository.save(todoList);

        // If no items found, return empty list
        if (allItems.isEmpty()) {
            System.out.println("No calendar items found in date range");
            return todoList;
        }

        // Sort items by priority and due date
        List<CalendarEvent> sortedItems = new ArrayList<>(allItems);
        sortedItems.sort((a, b) -> {
            // First sort by priority (high > medium > low)
            int priorityCompare = getPriorityValue(b.getPriority()) - getPriorityValue(a.getPriority());
            if (priorityCompare != 0) return priorityCompare;
            
            // Then by due date (earlier first)
            if (a.getDueDate() != null && b.getDueDate() != null) {
                return a.getDueDate().compareTo(b.getDueDate());
            }
            if (a.getDueDate() != null) return -1;
            if (b.getDueDate() != null) return 1;
            
            // Finally by start time for events
            if (a.getStartTime() != null && b.getStartTime() != null) {
                return a.getStartTime().compareTo(b.getStartTime());
            }
            return 0;
        });

        // Create todo items from calendar events
        // Start tasks at 9 AM on the start date
        LocalDateTime currentTime = createDTO.getStartDate().toLocalDate().atTime(9, 0);
        int sortOrder = 0;
        
        for (CalendarEvent event : sortedItems) {
            TodoItem item = new TodoItem();
            item.setTodoList(todoList);
            item.setTitle(event.isTask() ? "✓ " + event.getTitle() : event.getTitle());
            item.setDescription(event.getDescription());
            item.setPriority(event.getPriority() != null ? event.getPriority() : "medium");
            item.setCompleted(false);
            item.setSortOrder(sortOrder++);
            
            // Set scheduled times
            if (event.isTask()) {
                // For tasks, schedule them sequentially starting at 9 AM with estimated duration
                item.setScheduledStart(currentTime);
                LocalDateTime endTime = currentTime.plusHours(1); // Default 1 hour for tasks
                item.setScheduledEnd(endTime);
                currentTime = endTime.plusMinutes(15); // 15 min buffer
            } else {
                // For events, use their original times
                item.setScheduledStart(event.getStartTime());
                item.setScheduledEnd(event.getEndTime());
            }
            
            // Link to original event
            item.setEvent(event);
            
            todoList.addItem(item);
        }

        return todoListRepository.save(todoList);
    }

    @Transactional(readOnly = true)
    public List<TodoList> getUserTodoLists(Long userId) {
        return todoListRepository.findByUserUserIdOrderByUpdatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Optional<TodoList> getTodoListById(Long listId) {
        return Optional.ofNullable(todoListRepository.findByIdWithItems(listId));
    }

    @Transactional
    public TodoList updateTodoList(Long listId, String name) {
        TodoList todoList = todoListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Todo list not found"));
        
        todoList.setName(name);
        todoList.setUpdatedAt(LocalDateTime.now());
        
        return todoListRepository.save(todoList);
    }

    @Transactional
    public void deleteTodoList(Long listId) {
        todoListRepository.deleteById(listId);
    }

    @Transactional
    public TodoItem updateTodoItem(Long itemId, boolean completed) {
        // Use a query that eagerly fetches the event relationship
        TodoItem item = todoItemRepository.findByIdWithEvent(itemId)
                .orElseThrow(() -> new RuntimeException("Todo item not found"));
        
        item.setCompleted(completed);
        item.setUpdatedAt(LocalDateTime.now());
        
        // Update the parent list's updated timestamp
        if (item.getTodoList() != null) {
            item.getTodoList().setUpdatedAt(LocalDateTime.now());
            todoListRepository.save(item.getTodoList());
        }
        
        return todoItemRepository.save(item);
    }

    @Transactional
    public TodoItem updateTodoItemDetails(Long itemId, String title, String description, 
                                          String priority, LocalDateTime scheduledStart, 
                                          LocalDateTime scheduledEnd) {
        // Use a query that eagerly fetches the event relationship
        TodoItem item = todoItemRepository.findByIdWithEvent(itemId)
                .orElseThrow(() -> new RuntimeException("Todo item not found"));
        
        if (title != null) item.setTitle(title);
        if (description != null) item.setDescription(description);
        if (priority != null) item.setPriority(priority);
        if (scheduledStart != null) item.setScheduledStart(scheduledStart);
        if (scheduledEnd != null) item.setScheduledEnd(scheduledEnd);
        
        item.setUpdatedAt(LocalDateTime.now());
        
        return todoItemRepository.save(item);
    }

    @Transactional
    public void deleteTodoItem(Long itemId) {
        todoItemRepository.deleteById(itemId);
    }

    @Transactional
    public TodoItem addItemToList(Long listId, String title, String description, 
                                   String priority, LocalDateTime scheduledStart, 
                                   LocalDateTime scheduledEnd) {
        TodoList todoList = todoListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Todo list not found"));
        
        TodoItem item = new TodoItem();
        item.setTodoList(todoList);
        item.setTitle(title);
        item.setDescription(description);
        item.setPriority(priority != null ? priority : "medium");
        item.setScheduledStart(scheduledStart);
        item.setScheduledEnd(scheduledEnd);
        item.setCompleted(false);
        item.setSortOrder(todoList.getItems().size());
        
        todoList.addItem(item);
        todoList.setUpdatedAt(LocalDateTime.now());
        
        todoListRepository.save(todoList);
        
        return item;
    }
    
    private int getPriorityValue(String priority) {
        if (priority == null) return 1; // medium
        switch (priority.toLowerCase()) {
            case "high": return 3;
            case "medium": return 2;
            case "low": return 1;
            default: return 1;
        }
    }
}
