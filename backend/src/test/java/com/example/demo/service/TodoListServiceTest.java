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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class TodoListServiceTest {

    @Mock
    private TodoListRepository todoListRepository;

    @Mock
    private TodoItemRepository todoItemRepository;

    @Mock
    private CalendarEventRepository calendarEventRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TodoListService todoListService;

    private User testUser;
    private TodoList testTodoList;
    private TodoItem testTodoItem;
    private CalendarEvent testEvent;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUsername("testuser");

        testTodoList = new TodoList();
        testTodoList.setListId(1L);
        testTodoList.setUser(testUser);
        testTodoList.setName("Test List");
        testTodoList.setStartDate(LocalDateTime.now());
        testTodoList.setEndDate(LocalDateTime.now().plusDays(7));

        testTodoItem = new TodoItem();
        testTodoItem.setItemId(1L);
        testTodoItem.setTodoList(testTodoList);
        testTodoItem.setTitle("Test Item");
        testTodoItem.setCompleted(false);
        testTodoItem.setPriority("medium");

        testEvent = new CalendarEvent();
        testEvent.setEventId(1L);
        testEvent.setUser(testUser);
        testEvent.setTitle("Test Event");
        testEvent.setStartTime(LocalDateTime.now());
        testEvent.setEndTime(LocalDateTime.now().plusHours(1));
    }

    @Test
    @DisplayName("Should generate todo list from events with simple scheduling")
    void generateTodoList_ShouldCreateListWithItems() {
        TodoListCreateDTO createDTO = new TodoListCreateDTO();
        createDTO.setUserId(1L);
        createDTO.setName("Generated List");
        LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0);
        createDTO.setStartDate(startDate);
        createDTO.setEndDate(startDate.plusDays(7));

        List<CalendarEvent> events = Arrays.asList(testEvent);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(calendarEventRepository.findAllByUserIdAndDateRange(any(), any(), any(), any(), any()))
                .thenReturn(events);
        when(todoListRepository.save(any(TodoList.class))).thenAnswer(invocation -> {
            TodoList list = invocation.getArgument(0);
            list.setListId(1L);
            return list;
        });

        TodoList result = todoListService.generateTodoList(createDTO);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Generated List");
        assertThat(result.getItems()).isNotEmpty();
        // Verify event is linked to item
        assertThat(result.getItems().get(0).getEvent()).isNotNull();
        verify(todoListRepository, times(2)).save(any(TodoList.class));
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void generateTodoList_ShouldThrowException_WhenUserNotFound() {
        TodoListCreateDTO createDTO = new TodoListCreateDTO();
        createDTO.setUserId(999L);

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> todoListService.generateTodoList(createDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found");
    }

    @Test
    @DisplayName("Should get user todo lists ordered by updated date")
    void getUserTodoLists_ShouldReturnOrderedLists() {
        List<TodoList> lists = Arrays.asList(testTodoList);
        when(todoListRepository.findByUserUserIdOrderByUpdatedAtDesc(1L)).thenReturn(lists);

        List<TodoList> result = todoListService.getUserTodoLists(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test List");
    }

    @Test
    @DisplayName("Should get todo list by ID with items")
    void getTodoListById_ShouldReturnListWithItems() {
        when(todoListRepository.findByIdWithItems(1L)).thenReturn(testTodoList);

        Optional<TodoList> result = todoListService.getTodoListById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getListId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should update todo list name")
    void updateTodoList_ShouldUpdateName() {
        when(todoListRepository.findById(1L)).thenReturn(Optional.of(testTodoList));
        when(todoListRepository.save(any(TodoList.class))).thenReturn(testTodoList);

        TodoList result = todoListService.updateTodoList(1L, "Updated Name");

        assertThat(result.getName()).isEqualTo("Updated Name");
        verify(todoListRepository).save(any(TodoList.class));
    }

    @Test
    @DisplayName("Should delete todo list")
    void deleteTodoList_ShouldCallRepositoryDelete() {
        doNothing().when(todoListRepository).deleteById(1L);

        todoListService.deleteTodoList(1L);

        verify(todoListRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should update todo item completion status")
    void updateTodoItem_ShouldUpdateCompletionStatus() {
        testTodoItem.setTodoList(testTodoList);
        testTodoItem.setEvent(testEvent);
        when(todoItemRepository.findByIdWithEvent(1L)).thenReturn(Optional.of(testTodoItem));
        when(todoItemRepository.save(any(TodoItem.class))).thenReturn(testTodoItem);
        when(todoListRepository.save(any(TodoList.class))).thenReturn(testTodoList);

        TodoItem result = todoListService.updateTodoItem(1L, true);

        assertThat(result.isCompleted()).isTrue();
        verify(todoItemRepository).save(any(TodoItem.class));
    }

    @Test
    @DisplayName("Should add item to todo list")
    void addItemToList_ShouldAddNewItem() {
        when(todoListRepository.findById(1L)).thenReturn(Optional.of(testTodoList));
        when(todoListRepository.save(any(TodoList.class))).thenReturn(testTodoList);

        TodoItem result = todoListService.addItemToList(1L, "New Item", "Description", "high", null, null);

        assertThat(result.getTitle()).isEqualTo("New Item");
        assertThat(result.getPriority()).isEqualTo("high");
        assertThat(result.getTodoList()).isEqualTo(testTodoList);
    }
    
    @Test
    @DisplayName("Should update todo item details")
    void updateTodoItemDetails_ShouldUpdateItem() {
        testTodoItem.setTodoList(testTodoList);
        testTodoItem.setEvent(testEvent);
        when(todoItemRepository.findByIdWithEvent(1L)).thenReturn(Optional.of(testTodoItem));
        when(todoItemRepository.save(any(TodoItem.class))).thenReturn(testTodoItem);

        TodoItem result = todoListService.updateTodoItemDetails(1L, "Updated Title", "Updated Description", "low", null, null);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
        assertThat(result.getPriority()).isEqualTo("low");
        verify(todoItemRepository).save(any(TodoItem.class));
    }
    
    @Test
    @DisplayName("Should schedule tasks starting at 9 AM")
    void generateTodoList_ShouldScheduleTasksAt9AM() {
        TodoListCreateDTO createDTO = new TodoListCreateDTO();
        createDTO.setUserId(1L);
        createDTO.setName("Task List");
        LocalDateTime startDate = LocalDateTime.of(2024, 1, 1, 0, 0);
        createDTO.setStartDate(startDate);
        createDTO.setEndDate(startDate.plusDays(7));

        // Create a task
        CalendarEvent task = new CalendarEvent();
        task.setEventId(2L);
        task.setUser(testUser);
        task.setTitle("Test Task");
        task.setTask(true);
        task.setDueDate(startDate.toLocalDate());
        task.setPriority("high");

        List<CalendarEvent> events = Arrays.asList(task);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(calendarEventRepository.findAllByUserIdAndDateRange(any(), any(), any(), any(), any()))
                .thenReturn(events);
        when(todoListRepository.save(any(TodoList.class))).thenAnswer(invocation -> {
            TodoList list = invocation.getArgument(0);
            list.setListId(1L);
            return list;
        });

        TodoList result = todoListService.generateTodoList(createDTO);

        assertThat(result).isNotNull();
        assertThat(result.getItems()).hasSize(1);
        TodoItem item = result.getItems().get(0);
        // Task should start at 9 AM on the start date
        assertThat(item.getScheduledStart()).isEqualTo(startDate.toLocalDate().atTime(9, 0));
        assertThat(item.getEvent()).isNotNull();
        assertThat(item.getEvent().isTask()).isTrue();
    }

    @Test
    @DisplayName("Should delete todo item")
    void deleteTodoItem_ShouldCallRepositoryDelete() {
        doNothing().when(todoItemRepository).deleteById(1L);

        todoListService.deleteTodoItem(1L);

        verify(todoItemRepository).deleteById(1L);
    }

}

