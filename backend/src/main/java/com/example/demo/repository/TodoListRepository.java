package com.example.demo.repository;

import com.example.demo.entity.TodoList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TodoListRepository extends JpaRepository<TodoList, Long> {
    List<TodoList> findByUserUserIdOrderByUpdatedAtDesc(Long userId);
    
    List<TodoList> findByUserUserIdAndStartDateBetween(Long userId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT DISTINCT tl FROM TodoList tl " +
           "LEFT JOIN FETCH tl.items i " +
           "LEFT JOIN FETCH i.event e " +
           "WHERE tl.listId = :listId " +
           "ORDER BY i.sortOrder ASC")
    TodoList findByIdWithItems(@Param("listId") Long listId);
    
    void deleteByUserUserId(Long userId);
}

