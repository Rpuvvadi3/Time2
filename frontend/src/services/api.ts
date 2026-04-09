// API Service for communicating with the Spring Boot backend
// Updated: force recompile

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Get auth token from localStorage
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Types matching the backend DTOs
export interface CalendarEvent {
  eventId?: number;
  userId: number;
  title: string;
  description?: string;
  // For events - specific time range
  startTime?: string; // ISO datetime string
  endTime?: string;
  // For tasks - just a due date
  dueDate?: string;   // ISO date string (YYYY-MM-DD)
  task: boolean;      // true = task, false = event
  location?: string;
  repeating?: boolean;
  priority?: 'low' | 'medium' | 'high';
  estimatedDurationMinutes?: number;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
  // Repetition settings
  repetitionType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repetitionCount?: number;
}

export interface TodoItem {
  itemId?: number;
  listId?: number;
  eventId?: number;
  title: string;
  description?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  priority?: 'low' | 'medium' | 'high';
  completed: boolean;
  sortOrder?: number;
  isTask?: boolean;
}

export interface TodoList {
  listId?: number;
  userId: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
  items?: TodoItem[];
  totalItems?: number;
  completedItems?: number;
}

export interface CreateTodoListRequest {
  userId: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface AuthResponse {
  token?: string;
  type?: string;
  userId?: number;
  username?: string;
  email?: string;
  message?: string;
}

// Error handling wrapper
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// ============ Auth APIs ============

export const authApi = {
  // Login with username and password
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  // Register a new user
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  // Validate a token
  async validate(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse<AuthResponse>(response);
  },

  // Get current user info
  async me(): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<AuthResponse>(response);
  },
};

// ============ Calendar Event APIs ============

export const eventApi = {
  // Create a new event or task (returns array due to repetition support)
  async create(event: Omit<CalendarEvent, 'eventId' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(event),
    });
    return handleResponse<CalendarEvent[]>(response);
  },

  // Get all events and tasks for a user
  async getByUser(userId: number): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_BASE_URL}/events/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<CalendarEvent[]>(response);
  },

  // Get only tasks for a user
  async getTasksByUser(userId: number): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_BASE_URL}/events/user/${userId}/tasks`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<CalendarEvent[]>(response);
  },

  // Get only events (not tasks) for a user
  async getEventsOnlyByUser(userId: number): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_BASE_URL}/events/user/${userId}/events-only`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<CalendarEvent[]>(response);
  },

  // Get events for a user within a date range
  async getByUserAndRange(userId: number, start: string, end: string): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({ start, end });
    const response = await fetch(`${API_BASE_URL}/events/user/${userId}/range?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<CalendarEvent[]>(response);
  },

  // Get a single event
  async getById(eventId: number): Promise<CalendarEvent> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<CalendarEvent>(response);
  },

  // Update an event
  async update(eventId: number, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(event),
    });
    return handleResponse<CalendarEvent>(response);
  },

  // Delete an event
  async delete(eventId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.status}`);
    }
  },
};

// ============ Todo List APIs ============

export const todoListApi = {
  // Generate a new todo list from calendar events
  async generate(request: CreateTodoListRequest): Promise<TodoList> {
    const response = await fetch(`${API_BASE_URL}/todolists/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return handleResponse<TodoList>(response);
  },

  // Get all todo lists for a user
  async getByUser(userId: number): Promise<TodoList[]> {
    const response = await fetch(`${API_BASE_URL}/todolists/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TodoList[]>(response);
  },

  // Get a specific todo list with items
  async getById(listId: number): Promise<TodoList> {
    const response = await fetch(`${API_BASE_URL}/todolists/${listId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<TodoList>(response);
  },

  // Update todo list name
  async update(listId: number, name: string): Promise<TodoList> {
    const response = await fetch(`${API_BASE_URL}/todolists/${listId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse<TodoList>(response);
  },

  // Delete a todo list
  async delete(listId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/todolists/${listId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete todo list: ${response.status}`);
    }
  },

  // Add an item to a todo list
  async addItem(listId: number, item: Omit<TodoItem, 'itemId' | 'listId'>): Promise<TodoItem> {
    const response = await fetch(`${API_BASE_URL}/todolists/${listId}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse<TodoItem>(response);
  },

  // Update item completion status
  async updateItemCompletion(itemId: number, completed: boolean): Promise<TodoItem> {
    const response = await fetch(`${API_BASE_URL}/todolists/items/${itemId}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed }),
    });
    return handleResponse<TodoItem>(response);
  },

  // Update item details
  async updateItem(itemId: number, item: Partial<TodoItem>): Promise<TodoItem> {
    const response = await fetch(`${API_BASE_URL}/todolists/items/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse<TodoItem>(response);
  },

  // Delete an item
  async deleteItem(itemId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/todolists/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete item: ${response.status}`);
    }
  },
};

export default { authApi, eventApi, todoListApi };
