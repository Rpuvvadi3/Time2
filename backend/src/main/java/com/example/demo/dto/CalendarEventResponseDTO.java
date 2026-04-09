package com.example.demo.dto;

import com.example.demo.entity.CalendarEvent;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CalendarEventResponseDTO {
    private Long eventId;
    private Long userId;
    private String title;
    private String description;
    private LocalDateTime startTime;  // For events
    private LocalDateTime endTime;    // For events
    private LocalDate dueDate;        // For tasks
    private boolean task;             // true = task, false = event
    private String location;
    private boolean repeating;
    private String priority;
    private Integer estimatedDurationMinutes;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CalendarEventResponseDTO fromEntity(CalendarEvent event) {
        CalendarEventResponseDTO dto = new CalendarEventResponseDTO();
        dto.setEventId(event.getEventId());
        dto.setUserId(event.getUser() != null ? event.getUser().getUserId() : null);
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setDueDate(event.getDueDate());
        dto.setTask(event.isTask());
        dto.setLocation(event.getLocation());
        dto.setRepeating(event.isRepeating());
        dto.setPriority(event.getPriority());
        dto.setEstimatedDurationMinutes(event.getEstimatedDurationMinutes());
        dto.setColor(event.getColor());
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean isRepeating() {
        return repeating;
    }

    public void setRepeating(boolean repeating) {
        this.repeating = repeating;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }

    public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) {
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
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

    public boolean isTask() {
        return task;
    }

    public void setTask(boolean task) {
        this.task = task;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}

