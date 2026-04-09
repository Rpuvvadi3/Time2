package com.example.demo.service;

import com.example.demo.entity.CalendarEvent;
import com.example.demo.entity.User;
import com.example.demo.repository.CalendarEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CalendarEventService {
    
    private final CalendarEventRepository calendarEventRepository;

    @Autowired
    public CalendarEventService(CalendarEventRepository calendarEventRepository) {
        this.calendarEventRepository = calendarEventRepository;
    }

    @Transactional
    public CalendarEvent createEvent(CalendarEvent event) {
        event.setCreatedAt(LocalDateTime.now());
        event.setUpdatedAt(LocalDateTime.now());
        return calendarEventRepository.save(event);
    }

    /**
     * Create an event with repetition support
     * @param event The base event
     * @param repetitionType Type of repetition: "none", "daily", "weekly", "monthly", "yearly"
     * @param repetitionCount How many occurrences to create (default 10 for recurring events)
     * @return List of created events
     */
    @Transactional
    public List<CalendarEvent> createEventWithRepetition(CalendarEvent event, String repetitionType, int repetitionCount) {
        List<CalendarEvent> createdEvents = new ArrayList<>();
        
        if (repetitionType == null || repetitionType.isEmpty() || "none".equalsIgnoreCase(repetitionType)) {
            // No repetition - just create single event
            event.setRepeating(false);
            createdEvents.add(createEvent(event));
            return createdEvents;
        }

        // Mark as repeating
        event.setRepeating(true);
        
        // Create the first event
        CalendarEvent firstEvent = createEvent(event);
        createdEvents.add(firstEvent);

        // Create recurring instances
        for (int i = 1; i < repetitionCount; i++) {
            CalendarEvent recurringEvent = copyEvent(event);
            
            if (event.isTask()) {
                // For tasks, increment the due date
                if (event.getDueDate() != null) {
                    LocalDate newDueDate = calculateNextDate(event.getDueDate(), repetitionType, i);
                    recurringEvent.setDueDate(newDueDate);
                }
            } else {
                // For events, increment start and end times
                if (event.getStartTime() != null) {
                    LocalDateTime newStartTime = calculateNextDateTime(event.getStartTime(), repetitionType, i);
                    recurringEvent.setStartTime(newStartTime);
                }
                if (event.getEndTime() != null) {
                    LocalDateTime newEndTime = calculateNextDateTime(event.getEndTime(), repetitionType, i);
                    recurringEvent.setEndTime(newEndTime);
                }
            }
            
            recurringEvent.setCreatedAt(LocalDateTime.now());
            recurringEvent.setUpdatedAt(LocalDateTime.now());
            createdEvents.add(calendarEventRepository.save(recurringEvent));
        }

        return createdEvents;
    }

    private CalendarEvent copyEvent(CalendarEvent original) {
        CalendarEvent copy = new CalendarEvent();
        copy.setUser(original.getUser());
        copy.setTitle(original.getTitle());
        copy.setDescription(original.getDescription());
        copy.setStartTime(original.getStartTime());
        copy.setEndTime(original.getEndTime());
        copy.setDueDate(original.getDueDate());
        copy.setTask(original.isTask());
        copy.setLocation(original.getLocation());
        copy.setRepeating(original.isRepeating());
        copy.setPriority(original.getPriority());
        copy.setEstimatedDurationMinutes(original.getEstimatedDurationMinutes());
        copy.setColor(original.getColor());
        return copy;
    }

    private LocalDate calculateNextDate(LocalDate baseDate, String repetitionType, int occurrence) {
        switch (repetitionType.toLowerCase()) {
            case "daily":
                return baseDate.plusDays(occurrence);
            case "weekly":
                return baseDate.plusWeeks(occurrence);
            case "monthly":
                return baseDate.plusMonths(occurrence);
            case "yearly":
                return baseDate.plusYears(occurrence);
            default:
                return baseDate;
        }
    }

    private LocalDateTime calculateNextDateTime(LocalDateTime baseDateTime, String repetitionType, int occurrence) {
        switch (repetitionType.toLowerCase()) {
            case "daily":
                return baseDateTime.plusDays(occurrence);
            case "weekly":
                return baseDateTime.plusWeeks(occurrence);
            case "monthly":
                return baseDateTime.plusMonths(occurrence);
            case "yearly":
                return baseDateTime.plusYears(occurrence);
            default:
                return baseDateTime;
        }
    }

    @Transactional(readOnly = true)
    public Optional<CalendarEvent> getEventById(Long id) {
        return calendarEventRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<CalendarEvent> getEventsByUserId(Long userId) {
        return calendarEventRepository.findByUserUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<CalendarEvent> getTasksByUserId(Long userId) {
        return calendarEventRepository.findByUserUserIdAndTaskTrue(userId);
    }

    @Transactional(readOnly = true)
    public List<CalendarEvent> getEventsOnlyByUserId(Long userId) {
        return calendarEventRepository.findByUserUserIdAndTaskFalse(userId);
    }

    @Transactional(readOnly = true)
    public List<CalendarEvent> getEventsByUserIdAndDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return calendarEventRepository.findByUserUserIdAndStartTimeBetween(userId, start, end);
    }

    @Transactional(readOnly = true)
    public List<CalendarEvent> getTasksByUserIdAndDateRange(Long userId, LocalDate start, LocalDate end) {
        return calendarEventRepository.findByUserUserIdAndTaskTrueAndDueDateBetween(userId, start, end);
    }

    @Transactional(readOnly = true)
    public List<CalendarEvent> getAllByUserIdAndDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return calendarEventRepository.findAllByUserIdAndDateRange(
                userId, start, end, start.toLocalDate(), end.toLocalDate());
    }

    @Transactional
    public CalendarEvent updateEvent(CalendarEvent event) {
        event.setUpdatedAt(LocalDateTime.now());
        return calendarEventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        calendarEventRepository.deleteById(id);
    }

    @Transactional
    public void deleteEventsByUserId(Long userId) {
        calendarEventRepository.deleteByUserUserId(userId);
    }
}
