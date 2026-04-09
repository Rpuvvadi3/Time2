-- Insert sample users (password is 'test' hashed with BCrypt)
INSERT INTO users (username, email, password_hash) VALUES
('test', 'test@example.com', '$2a$10$6KwSQR4WCYq0dj7Sh9rCIOzyvXeqXOII96T.dmJxKF8UymhWrKWbq'),
('john_doe', 'john@example.com', '$2a$10$6KwSQR4WCYq0dj7Sh9rCIOzyvXeqXOII96T.dmJxKF8UymhWrKWbq'),
('jane_smith', 'jane@example.com', '$2a$10$8KwSQR4WCYq0dj7Sh9rCIOzyvXeqXOII96T.dmJxKF8UymhWrKWbq');
