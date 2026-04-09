package com.example.demo.controller;

import com.example.demo.dto.CalendarEventCreateDTO;
import com.example.demo.entity.CalendarEvent;
import com.example.demo.entity.User;
import com.example.demo.service.CalendarEventService;
import com.example.demo.service.UserService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class CalendarEventControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CalendarEventService eventService;

    @Mock
    private UserService userService;

    @InjectMocks
    private CalendarEventController calendarEventController;

    private ObjectMapper objectMapper;
    private User testUser;
    private CalendarEvent testEvent;
    private CalendarEvent testTask;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(calendarEventController).build();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("testuser");

        testEvent = new CalendarEvent();
        testEvent.setEventId(1L);
        testEvent.setUser(testUser);
        testEvent.setTitle("Test Event");
        testEvent.setTask(false);
        testEvent.setStartTime(LocalDateTime.of(2024, 1, 15, 10, 0));
        testEvent.setEndTime(LocalDateTime.of(2024, 1, 15, 11, 0));
        testEvent.setPriority("medium");
        testEvent.setCreatedAt(LocalDateTime.now());
        testEvent.setUpdatedAt(LocalDateTime.now());

        testTask = new CalendarEvent();
        testTask.setEventId(2L);
        testTask.setUser(testUser);
        testTask.setTitle("Test Task");
        testTask.setTask(true);
        testTask.setDueDate(LocalDate.of(2024, 1, 20));
        testTask.setPriority("high");
        testTask.setCreatedAt(LocalDateTime.now());
        testTask.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should create an event successfully")
    void createEvent_ShouldReturnCreatedEvent() throws Exception {
        CalendarEventCreateDTO createDTO = new CalendarEventCreateDTO();
        createDTO.setUserId(1L);
        createDTO.setTitle("New Event");
        createDTO.setTask(false);
        createDTO.setStartTime(LocalDateTime.of(2024, 1, 15, 10, 0));
        createDTO.setEndTime(LocalDateTime.of(2024, 1, 15, 11, 0));

        when(userService.getUserById(1L)).thenReturn(Optional.of(testUser));
        when(eventService.createEventWithRepetition(any(CalendarEvent.class), any(), anyInt()))
                .thenReturn(Arrays.asList(testEvent));

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventId").value(1))
                .andExpect(jsonPath("$[0].title").value("Test Event"))
                .andExpect(jsonPath("$[0].task").value(false));
    }

    @Test
    @DisplayName("Should create a task successfully")
    void createTask_ShouldReturnCreatedTask() throws Exception {
        CalendarEventCreateDTO createDTO = new CalendarEventCreateDTO();
        createDTO.setUserId(1L);
        createDTO.setTitle("New Task");
        createDTO.setTask(true);
        createDTO.setDueDate(LocalDate.of(2024, 1, 20));

        when(userService.getUserById(1L)).thenReturn(Optional.of(testUser));
        when(eventService.createEventWithRepetition(any(CalendarEvent.class), any(), anyInt()))
                .thenReturn(Arrays.asList(testTask));

        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventId").value(2))
                .andExpect(jsonPath("$[0].title").value("Test Task"))
                .andExpect(jsonPath("$[0].task").value(true));
    }

    @Test
    @DisplayName("Should get all events for user")
    void getUserEvents_ShouldReturnEventsList() throws Exception {
        when(eventService.getEventsByUserId(1L)).thenReturn(Arrays.asList(testEvent, testTask));

        mockMvc.perform(get("/api/events/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("Should get only tasks for user")
    void getUserTasks_ShouldReturnTasksList() throws Exception {
        when(eventService.getTasksByUserId(1L)).thenReturn(Arrays.asList(testTask));

        mockMvc.perform(get("/api/events/user/1/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].task").value(true));
    }

    @Test
    @DisplayName("Should get only events for user")
    void getUserEventsOnly_ShouldReturnEventsList() throws Exception {
        when(eventService.getEventsOnlyByUserId(1L)).thenReturn(Arrays.asList(testEvent));

        mockMvc.perform(get("/api/events/user/1/events-only"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].task").value(false));
    }

    @Test
    @DisplayName("Should get event by ID")
    void getEvent_ShouldReturnEvent() throws Exception {
        when(eventService.getEventById(1L)).thenReturn(Optional.of(testEvent));

        mockMvc.perform(get("/api/events/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventId").value(1))
                .andExpect(jsonPath("$.title").value("Test Event"));
    }

    @Test
    @DisplayName("Should return 404 when event not found")
    void getEvent_ShouldReturn404_WhenNotFound() throws Exception {
        when(eventService.getEventById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/events/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should update event successfully")
    void updateEvent_ShouldReturnUpdatedEvent() throws Exception {
        CalendarEventCreateDTO updateDTO = new CalendarEventCreateDTO();
        updateDTO.setUserId(1L);
        updateDTO.setTitle("Updated Event");
        updateDTO.setTask(false);
        updateDTO.setStartTime(LocalDateTime.of(2024, 1, 15, 14, 0));
        updateDTO.setEndTime(LocalDateTime.of(2024, 1, 15, 15, 0));

        testEvent.setTitle("Updated Event");

        when(eventService.getEventById(1L)).thenReturn(Optional.of(testEvent));
        when(eventService.updateEvent(any(CalendarEvent.class))).thenReturn(testEvent);

        mockMvc.perform(put("/api/events/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Event"));
    }

    @Test
    @DisplayName("Should delete event successfully")
    void deleteEvent_ShouldReturn204() throws Exception {
        doNothing().when(eventService).deleteEvent(1L);

        mockMvc.perform(delete("/api/events/1"))
                .andExpect(status().isNoContent());

        verify(eventService).deleteEvent(1L);
    }

    @Test
    @DisplayName("Should get events in date range")
    void getUserEventsInRange_ShouldReturnEventsInRange() throws Exception {
        LocalDateTime start = LocalDateTime.of(2024, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2024, 1, 31, 23, 59);

        when(eventService.getEventsByUserIdAndDateRange(eq(1L), any(), any()))
                .thenReturn(Arrays.asList(testEvent));

        mockMvc.perform(get("/api/events/user/1/range")
                        .param("start", "2024-01-01T00:00:00")
                        .param("end", "2024-01-31T23:59:59"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}

