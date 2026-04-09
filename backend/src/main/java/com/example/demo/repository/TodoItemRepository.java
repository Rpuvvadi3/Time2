package com.example.demo.repository;

import com.example.demo.entity.TodoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TodoItemRepository extends JpaRepository<TodoItem, Long> {
    List<TodoItem> findByTodoListListIdOrderBySortOrderAsc(Long listId);
    
    List<TodoItem> findByTodoListListIdAndCompletedOrderBySortOrderAsc(Long listId, boolean completed);
    
    @Query("SELECT i FROM TodoItem i LEFT JOIN FETCH i.event WHERE i.itemId = :itemId")
    Optional<TodoItem> findByIdWithEvent(@Param("itemId") Long itemId);
    
    void deleteByTodoListListId(Long listId);
}

