package com.example.demo.service;

import com.example.demo.entity.CalendarEvent;
import com.example.demo.entity.User;
import com.example.demo.repository.CalendarEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class CalendarEventServiceTest {

    @Mock
    private CalendarEventRepository calendarEventRepository;

    @InjectMocks
    private CalendarEventService calendarEventService;

    private User testUser;
    private CalendarEvent testEvent;
    private CalendarEvent testTask;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testEvent = new CalendarEvent();
        testEvent.setEventId(1L);
        testEvent.setUser(testUser);
        testEvent.setTitle("Test Event");
        testEvent.setDescription("Test Description");
        testEvent.setTask(false);
        testEvent.setStartTime(LocalDateTime.now());
        testEvent.setEndTime(LocalDateTime.now().plusHours(1));
        testEvent.setPriority("medium");

        testTask = new CalendarEvent();
        testTask.setEventId(2L);
        testTask.setUser(testUser);
        testTask.setTitle("Test Task");
        testTask.setDescription("Task Description");
        testTask.setTask(true);
        testTask.setDueDate(LocalDate.now().plusDays(1));
        testTask.setPriority("high");
    }

    @Test
    @DisplayName("Should create an event successfully")
    void createEvent_ShouldSaveAndReturnEvent() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(testEvent);

        CalendarEvent result = calendarEventService.createEvent(testEvent);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Event");
        assertThat(result.isTask()).isFalse();
        verify(calendarEventRepository, times(1)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should create a task successfully")
    void createTask_ShouldSaveAndReturnTask() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(testTask);

        CalendarEvent result = calendarEventService.createEvent(testTask);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test Task");
        assertThat(result.isTask()).isTrue();
        assertThat(result.getDueDate()).isNotNull();
        verify(calendarEventRepository, times(1)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should get event by ID")
    void getEventById_ShouldReturnEvent() {
        when(calendarEventRepository.findById(1L)).thenReturn(Optional.of(testEvent));

        Optional<CalendarEvent> result = calendarEventService.getEventById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("Test Event");
    }

    @Test
    @DisplayName("Should return empty when event not found")
    void getEventById_ShouldReturnEmpty_WhenNotFound() {
        when(calendarEventRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<CalendarEvent> result = calendarEventService.getEventById(999L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should get all events by user ID")
    void getEventsByUserId_ShouldReturnAllEvents() {
        List<CalendarEvent> events = Arrays.asList(testEvent, testTask);
        when(calendarEventRepository.findByUserUserId(1L)).thenReturn(events);

        List<CalendarEvent> result = calendarEventService.getEventsByUserId(1L);

        assertThat(result).hasSize(2);
        assertThat(result).containsExactlyInAnyOrder(testEvent, testTask);
    }

    @Test
    @DisplayName("Should get only tasks by user ID")
    void getTasksByUserId_ShouldReturnOnlyTasks() {
        List<CalendarEvent> tasks = Arrays.asList(testTask);
        when(calendarEventRepository.findByUserUserIdAndTaskTrue(1L)).thenReturn(tasks);

        List<CalendarEvent> result = calendarEventService.getTasksByUserId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isTask()).isTrue();
    }

    @Test
    @DisplayName("Should get only events (not tasks) by user ID")
    void getEventsOnlyByUserId_ShouldReturnOnlyEvents() {
        List<CalendarEvent> events = Arrays.asList(testEvent);
        when(calendarEventRepository.findByUserUserIdAndTaskFalse(1L)).thenReturn(events);

        List<CalendarEvent> result = calendarEventService.getEventsOnlyByUserId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isTask()).isFalse();
    }

    @Test
    @DisplayName("Should update event successfully")
    void updateEvent_ShouldSaveAndReturnUpdatedEvent() {
        testEvent.setTitle("Updated Event");
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(testEvent);

        CalendarEvent result = calendarEventService.updateEvent(testEvent);

        assertThat(result.getTitle()).isEqualTo("Updated Event");
        assertThat(result.getUpdatedAt()).isNotNull();
        verify(calendarEventRepository, times(1)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should delete event by ID")
    void deleteEvent_ShouldCallRepositoryDelete() {
        doNothing().when(calendarEventRepository).deleteById(1L);

        calendarEventService.deleteEvent(1L);

        verify(calendarEventRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should get events by date range")
    void getEventsByUserIdAndDateRange_ShouldReturnEventsInRange() {
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = LocalDateTime.now().plusDays(7);
        List<CalendarEvent> events = Arrays.asList(testEvent);
        when(calendarEventRepository.findByUserUserIdAndStartTimeBetween(1L, start, end))
                .thenReturn(events);

        List<CalendarEvent> result = calendarEventService.getEventsByUserIdAndDateRange(1L, start, end);

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should delete all events by user ID")
    void deleteEventsByUserId_ShouldCallRepositoryDelete() {
        doNothing().when(calendarEventRepository).deleteByUserUserId(1L);

        calendarEventService.deleteEventsByUserId(1L);

        verify(calendarEventRepository, times(1)).deleteByUserUserId(1L);
    }

    // ============ Repetition Tests ============

    @Test
    @DisplayName("Should create single event when repetition is none")
    void createEventWithRepetition_None_ShouldCreateSingleEvent() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(testEvent);

        List<CalendarEvent> result = calendarEventService.createEventWithRepetition(testEvent, "none", 10);

        assertThat(result).hasSize(1);
        verify(calendarEventRepository, times(1)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should create single event when repetition is null")
    void createEventWithRepetition_Null_ShouldCreateSingleEvent() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(testEvent);

        List<CalendarEvent> result = calendarEventService.createEventWithRepetition(testEvent, null, 10);

        assertThat(result).hasSize(1);
        verify(calendarEventRepository, times(1)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should create single event when repetition is empty")
    void createEventWithRepetition_Empty_ShouldCreateSingleEvent() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(testEvent);

        List<CalendarEvent> result = calendarEventService.createEventWithRepetition(testEvent, "", 10);

        assertThat(result).hasSize(1);
        verify(calendarEventRepository, times(1)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should create daily repeating events")
    void createEventWithRepetition_Daily_ShouldCreateMultipleEvents() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenAnswer(invocation -> {
            CalendarEvent event = invocation.getArgument(0);
            event.setEventId((long) (Math.random() * 1000));
            return event;
        });

        List<CalendarEvent> result = calendarEventService.createEventWithRepetition(testEvent, "daily", 5);

        assertThat(result).hasSize(5);
        verify(calendarEventRepository, times(5)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should create weekly repeating events")
    void createEventWithRepetition_Weekly_ShouldCreateMultipleEvents() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenAnswer(invocation -> {
            CalendarEvent event = invocation.getArgument(0);
            event.setEventId((long) (Math.random() * 1000));
            return event;
        });

        List<CalendarEvent> result = calendarEventService.createEventWithRepetition(testEvent, "weekly", 4);

        assertThat(result).hasSize(4);
        verify(calendarEventRepository, times(4)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should create monthly repeating events")
    void createEventWithRepetition_Monthly_ShouldCreateMultipleEvents() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenAnswer(invocation -> {
            CalendarEvent event = invocation.getArgument(0);
            event.setEventId((long) (Math.random() * 1000));
            return event;
        });

        List<CalendarEvent> result = calendarEventService.createEventWithRepetition(testEvent, "monthly", 3);

        assertThat(result).hasSize(3);
        verify(calendarEventRepository, times(3)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should create yearly repeating events")
    void createEventWithRepetition_Yearly_ShouldCreateMultipleEvents() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenAnswer(invocation -> {
            CalendarEvent event = invocation.getArgument(0);
            event.setEventId((long) (Math.random() * 1000));
            return event;
        });

        List<CalendarEvent> result = calendarEventService.createEventWithRepetition(testEvent, "yearly", 2);

        assertThat(result).hasSize(2);
        verify(calendarEventRepository, times(2)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should create daily repeating tasks with due dates")
    void createTaskWithRepetition_Daily_ShouldCreateMultipleTasks() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenAnswer(invocation -> {
            CalendarEvent event = invocation.getArgument(0);
            event.setEventId((long) (Math.random() * 1000));
            return event;
        });

        List<CalendarEvent> result = calendarEventService.createEventWithRepetition(testTask, "daily", 5);

        assertThat(result).hasSize(5);
        verify(calendarEventRepository, times(5)).save(any(CalendarEvent.class));
    }

    @Test
    @DisplayName("Should mark events as repeating when using repetition")
    void createEventWithRepetition_ShouldMarkAsRepeating() {
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenAnswer(invocation -> {
            CalendarEvent event = invocation.getArgument(0);
            event.setEventId((long) (Math.random() * 1000));
            return event;
        });

        calendarEventService.createEventWithRepetition(testEvent, "daily", 3);

        verify(calendarEventRepository, times(3)).save(argThat(event -> 
            event.isRepeating() == true
        ));
    }
}

