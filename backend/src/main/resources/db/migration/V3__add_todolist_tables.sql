-- TodoList table for generated todo lists
CREATE TABLE todo_lists (
    list_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    name VARCHAR(100) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TodoItem table for individual tasks in a list
CREATE TABLE todo_items (
    item_id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES todo_lists(list_id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES calendar_events(event_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT FALSE,
    ai_reasoning TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add priority and estimated duration to calendar events for AI scheduling
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS color VARCHAR(20);

