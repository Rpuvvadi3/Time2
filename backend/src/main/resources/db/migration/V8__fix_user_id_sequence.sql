-- Fix the user_id sequence to be in sync with existing data
-- This ensures new users get unique IDs

SELECT setval('users_user_id_seq', COALESCE((SELECT MAX(user_id) FROM users), 1), true);

