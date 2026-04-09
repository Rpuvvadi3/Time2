-- Fix all remaining ID columns from INTEGER to BIGINT
-- This migration fixes user_id, list_id, and item_id columns to match Java Long type

-- Step 1: Drop all foreign key constraints that need to be recreated
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_user_id_fkey;
ALTER TABLE todo_lists DROP CONSTRAINT IF EXISTS todo_lists_user_id_fkey;
ALTER TABLE todo_items DROP CONSTRAINT IF EXISTS todo_items_list_id_fkey;

-- Step 2: Fix users.user_id (SERIAL to BIGSERIAL)
ALTER TABLE users ALTER COLUMN user_id TYPE BIGINT;
DROP SEQUENCE IF EXISTS users_user_id_seq CASCADE;
CREATE SEQUENCE users_user_id_seq AS BIGINT OWNED BY users.user_id;
ALTER TABLE users ALTER COLUMN user_id SET DEFAULT nextval('users_user_id_seq');

-- Step 3: Fix calendar_events.user_id (INTEGER to BIGINT)
ALTER TABLE calendar_events ALTER COLUMN user_id TYPE BIGINT;

-- Step 4: Fix todo_lists.list_id (SERIAL to BIGSERIAL)
ALTER TABLE todo_lists ALTER COLUMN list_id TYPE BIGINT;
DROP SEQUENCE IF EXISTS todo_lists_list_id_seq CASCADE;
CREATE SEQUENCE todo_lists_list_id_seq AS BIGINT OWNED BY todo_lists.list_id;
ALTER TABLE todo_lists ALTER COLUMN list_id SET DEFAULT nextval('todo_lists_list_id_seq');

-- Step 5: Fix todo_lists.user_id (INTEGER to BIGINT)
ALTER TABLE todo_lists ALTER COLUMN user_id TYPE BIGINT;

-- Step 6: Fix todo_items.item_id (SERIAL to BIGSERIAL)
ALTER TABLE todo_items ALTER COLUMN item_id TYPE BIGINT;
DROP SEQUENCE IF EXISTS todo_items_item_id_seq CASCADE;
CREATE SEQUENCE todo_items_item_id_seq AS BIGINT OWNED BY todo_items.item_id;
ALTER TABLE todo_items ALTER COLUMN item_id SET DEFAULT nextval('todo_items_item_id_seq');

-- Step 7: Fix todo_items.list_id (INTEGER to BIGINT)
ALTER TABLE todo_items ALTER COLUMN list_id TYPE BIGINT;

-- Step 8: Recreate all foreign key constraints
ALTER TABLE calendar_events 
  ADD CONSTRAINT calendar_events_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE todo_lists 
  ADD CONSTRAINT todo_lists_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE todo_items 
  ADD CONSTRAINT todo_items_list_id_fkey 
  FOREIGN KEY (list_id) REFERENCES todo_lists(list_id) ON DELETE CASCADE;

