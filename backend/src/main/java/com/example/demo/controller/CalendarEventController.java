package com.example.demo.controller;

import com.example.demo.dto.CalendarEventCreateDTO;
import com.example.demo.dto.CalendarEventResponseDTO;
import com.example.demo.entity.CalendarEvent;
import com.example.demo.entity.User;
import com.example.demo.service.CalendarEventService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CalendarEventController {

    private final CalendarEventService eventService;
    private final UserService userService;

    @Autowired
    public CalendarEventController(CalendarEventService eventService, UserService userService) {
        this.eventService = eventService;
        this.userService = userService;
    }

    /**
     * Create a new calendar event or task with optional repetition
     */
    @PostMapping
    public ResponseEntity<List<CalendarEventResponseDTO>> createEvent(@RequestBody CalendarEventCreateDTO eventCreateDTO) {
        User user = userService.getUserById(eventCreateDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        CalendarEvent event = new CalendarEvent();
        event.setUser(user);
        event.setTitle(eventCreateDTO.getTitle());
        event.setDescription(eventCreateDTO.getDescription());
        event.setTask(eventCreateDTO.isTask());
        
        if (eventCreateDTO.isTask()) {
            event.setDueDate(eventCreateDTO.getDueDate());
            event.setStartTime(null);
            event.setEndTime(null);
        } else {
            event.setStartTime(eventCreateDTO.getStartTime());
            event.setEndTime(eventCreateDTO.getEndTime());
            event.setDueDate(null);
        }
        
        event.setLocation(eventCreateDTO.getLocation());
        event.setPriority(eventCreateDTO.getPriority());
        event.setEstimatedDurationMinutes(eventCreateDTO.getEstimatedDurationMinutes());
        event.setColor(eventCreateDTO.getColor());

        // Handle repetition
        String repetitionType = eventCreateDTO.getRepetitionType();
        int repetitionCount = eventCreateDTO.getRepetitionCount() > 0 ? eventCreateDTO.getRepetitionCount() : 10;

        List<CalendarEvent> createdEvents = eventService.createEventWithRepetition(event, repetitionType, repetitionCount);
        
        List<CalendarEventResponseDTO> response = createdEvents.stream()
                .map(CalendarEventResponseDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Get all events and tasks for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CalendarEventResponseDTO>> getUserEvents(@PathVariable Long userId) {
        List<CalendarEvent> events = eventService.getEventsByUserId(userId);
        List<CalendarEventResponseDTO> response = events.stream()
                .map(CalendarEventResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get only tasks for a user
     */
    @GetMapping("/user/{userId}/tasks")
    public ResponseEntity<List<CalendarEventResponseDTO>> getUserTasks(@PathVariable Long userId) {
        List<CalendarEvent> tasks = eventService.getTasksByUserId(userId);
        List<CalendarEventResponseDTO> response = tasks.stream()
                .map(CalendarEventResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get only events (not tasks) for a user
     */
    @GetMapping("/user/{userId}/events-only")
    public ResponseEntity<List<CalendarEventResponseDTO>> getUserEventsOnly(@PathVariable Long userId) {
        List<CalendarEvent> events = eventService.getEventsOnlyByUserId(userId);
        List<CalendarEventResponseDTO> response = events.stream()
                .map(CalendarEventResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get events for a user within a date range
     */
    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<CalendarEventResponseDTO>> getUserEventsInRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<CalendarEvent> events = eventService.getEventsByUserIdAndDateRange(userId, start, end);
        List<CalendarEventResponseDTO> response = events.stream()
                .map(CalendarEventResponseDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific event by ID
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<CalendarEventResponseDTO> getEvent(@PathVariable Long eventId) {
        return eventService.getEventById(eventId)
                .map(event -> ResponseEntity.ok(CalendarEventResponseDTO.fromEntity(event)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update an existing event or task
     */
    @PutMapping("/{eventId}")
    public ResponseEntity<CalendarEventResponseDTO> updateEvent(
            @PathVariable Long eventId,
            @RequestBody CalendarEventCreateDTO eventDTO) {
        CalendarEvent existingEvent = eventService.getEventById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        existingEvent.setTitle(eventDTO.getTitle());
        existingEvent.setDescription(eventDTO.getDescription());
        existingEvent.setTask(eventDTO.isTask());
        
        if (eventDTO.isTask()) {
            existingEvent.setDueDate(eventDTO.getDueDate());
            existingEvent.setStartTime(null);
            existingEvent.setEndTime(null);
        } else {
            existingEvent.setStartTime(eventDTO.getStartTime());
            existingEvent.setEndTime(eventDTO.getEndTime());
            existingEvent.setDueDate(null);
        }
        
        existingEvent.setLocation(eventDTO.getLocation());
        existingEvent.setRepeating(eventDTO.isRepeating());
        existingEvent.setPriority(eventDTO.getPriority());
        existingEvent.setEstimatedDurationMinutes(eventDTO.getEstimatedDurationMinutes());
        existingEvent.setColor(eventDTO.getColor());

        CalendarEvent updatedEvent = eventService.updateEvent(existingEvent);
        return ResponseEntity.ok(CalendarEventResponseDTO.fromEntity(updatedEvent));
    }

    /**
     * Delete an event or task
     */
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }
}
