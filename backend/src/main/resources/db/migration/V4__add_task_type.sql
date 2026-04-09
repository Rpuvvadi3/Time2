-- Add is_task field to distinguish tasks from events
-- Tasks: no specific time range, just a date (due_date)
-- Events: have specific start and end times

ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS is_task BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Make start_time and end_time nullable for tasks
ALTER TABLE calendar_events 
ALTER COLUMN start_time DROP NOT NULL,
ALTER COLUMN end_time DROP NOT NULL;

