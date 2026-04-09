package com.example.demo.controller;

import com.example.demo.dto.TodoItemDTO;
import com.example.demo.dto.TodoListCreateDTO;
import com.example.demo.entity.CalendarEvent;
import com.example.demo.entity.TodoItem;
import com.example.demo.entity.TodoList;
import com.example.demo.entity.User;
import com.example.demo.service.TodoListService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class TodoListControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TodoListService todoListService;

    @InjectMocks
    private TodoListController todoListController;

    private ObjectMapper objectMapper;
    private User testUser;
    private TodoList testTodoList;
    private TodoItem testTodoItem;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(todoListController).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("testuser");

        testTodoList = new TodoList();
        testTodoList.setListId(1L);
        testTodoList.setUser(testUser);
        testTodoList.setName("Test List");
        testTodoList.setStartDate(LocalDateTime.of(2024, 1, 1, 0, 0));
        testTodoList.setEndDate(LocalDateTime.of(2024, 1, 7, 23, 59));
        testTodoList.setCreatedAt(LocalDateTime.now());
        testTodoList.setUpdatedAt(LocalDateTime.now());

        CalendarEvent testEvent = new CalendarEvent();
        testEvent.setEventId(1L);
        testEvent.setUser(testUser);
        testEvent.setTitle("Test Event");
        testEvent.setTask(false);
        
        testTodoItem = new TodoItem();
        testTodoItem.setItemId(1L);
        testTodoItem.setTodoList(testTodoList);
        testTodoItem.setEvent(testEvent);
        testTodoItem.setTitle("Test Item");
        testTodoItem.setCompleted(false);
        testTodoItem.setPriority("medium");
        testTodoItem.setCreatedAt(LocalDateTime.now());
        testTodoItem.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should generate todo list successfully")
    void generateTodoList_ShouldReturnCreatedList() throws Exception {
        TodoListCreateDTO createDTO = new TodoListCreateDTO();
        createDTO.setUserId(1L);
        createDTO.setName("New List");
        createDTO.setStartDate(LocalDateTime.of(2024, 1, 1, 0, 0));
        createDTO.setEndDate(LocalDateTime.of(2024, 1, 7, 23, 59));

        when(todoListService.generateTodoList(any(TodoListCreateDTO.class))).thenReturn(testTodoList);

        mockMvc.perform(post("/api/todolists/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listId").value(1))
                .andExpect(jsonPath("$.name").value("Test List"));
    }

    @Test
    @DisplayName("Should get user todo lists")
    void getUserTodoLists_ShouldReturnListOfTodoLists() throws Exception {
        when(todoListService.getUserTodoLists(1L)).thenReturn(Arrays.asList(testTodoList));

        mockMvc.perform(get("/api/todolists/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Test List"));
    }

    @Test
    @DisplayName("Should get todo list by ID")
    void getTodoList_ShouldReturnTodoList() throws Exception {
        when(todoListService.getTodoListById(1L)).thenReturn(Optional.of(testTodoList));

        mockMvc.perform(get("/api/todolists/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.listId").value(1))
                .andExpect(jsonPath("$.name").value("Test List"));
    }

    @Test
    @DisplayName("Should return 404 when todo list not found")
    void getTodoList_ShouldReturn404_WhenNotFound() throws Exception {
        when(todoListService.getTodoListById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/todolists/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should update todo list name")
    void updateTodoList_ShouldReturnUpdatedList() throws Exception {
        testTodoList.setName("Updated Name");
        when(todoListService.updateTodoList(eq(1L), eq("Updated Name"))).thenReturn(testTodoList);

        mockMvc.perform(put("/api/todolists/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Updated Name\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    @DisplayName("Should delete todo list")
    void deleteTodoList_ShouldReturn204() throws Exception {
        doNothing().when(todoListService).deleteTodoList(1L);

        mockMvc.perform(delete("/api/todolists/1"))
                .andExpect(status().isNoContent());

        verify(todoListService).deleteTodoList(1L);
    }

    @Test
    @DisplayName("Should add item to todo list")
    void addItem_ShouldReturnCreatedItem() throws Exception {
        TodoItemDTO itemDTO = new TodoItemDTO();
        itemDTO.setTitle("New Item");
        itemDTO.setPriority("high");
        itemDTO.setCompleted(false);

        when(todoListService.addItemToList(eq(1L), eq("New Item"), any(), eq("high"), any(), any()))
                .thenReturn(testTodoItem);

        mockMvc.perform(post("/api/todolists/1/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(itemDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Item"));
    }

    @Test
    @DisplayName("Should update item completion status")
    void updateItemCompletion_ShouldReturnUpdatedItem() throws Exception {
        testTodoItem.setCompleted(true);
        when(todoListService.updateTodoItem(eq(1L), eq(true))).thenReturn(testTodoItem);

        mockMvc.perform(patch("/api/todolists/items/1/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"completed\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    @DisplayName("Should delete todo item")
    void deleteItem_ShouldReturn204() throws Exception {
        doNothing().when(todoListService).deleteTodoItem(1L);

        mockMvc.perform(delete("/api/todolists/items/1"))
                .andExpect(status().isNoContent());

        verify(todoListService).deleteTodoItem(1L);
    }
}

