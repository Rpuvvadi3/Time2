package com.example.demo.repository;

import com.example.demo.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    
    // Get all events and tasks for a user
    List<CalendarEvent> findByUserUserId(Long userId);
    
    // Get only tasks for a user
    List<CalendarEvent> findByUserUserIdAndTaskTrue(Long userId);
    
    // Get only events (not tasks) for a user
    List<CalendarEvent> findByUserUserIdAndTaskFalse(Long userId);
    
    // Get events within a time range (for events with startTime)
    List<CalendarEvent> findByUserUserIdAndStartTimeBetween(Long userId, LocalDateTime start, LocalDateTime end);
    
    // Get tasks within a date range (for tasks with dueDate)
    List<CalendarEvent> findByUserUserIdAndTaskTrueAndDueDateBetween(Long userId, LocalDate start, LocalDate end);
    
    // Get all items (tasks and events) within a date range
    // For events: startTime must be >= start and < end (exclusive end to include full last day)
    // For tasks: dueDate must be >= startDate and <= endDate (inclusive)
    @Query("SELECT e FROM CalendarEvent e WHERE e.user.userId = :userId AND " +
           "((e.task = false AND e.startTime >= :start AND e.startTime < :endExclusive) OR " +
           "(e.task = true AND e.dueDate >= :startDate AND e.dueDate <= :endDate))")
    List<CalendarEvent> findAllByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("endExclusive") LocalDateTime endExclusive,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
    void deleteByUserUserId(Long userId);
}
