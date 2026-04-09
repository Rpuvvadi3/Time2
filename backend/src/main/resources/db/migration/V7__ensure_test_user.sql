-- Ensure test user exists with correct password hash
-- Password: 'test' hashed with BCrypt
-- This migration uses INSERT ... ON CONFLICT to avoid duplicates

INSERT INTO users (username, email, password_hash, created_at)
VALUES 
  ('test', 'test@example.com', '$2a$10$6KwSQR4WCYq0dj7Sh9rCIOzyvXeqXOII96T.dmJxKF8UymhWrKWbq', CURRENT_TIMESTAMP)
ON CONFLICT (username) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email;

