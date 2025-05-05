-- Tạo database (nếu chưa tồn tại)
CREATE DATABASE IF NOT EXISTS flashcard_game;
USE flashcard_game;

-- Tạo bảng topics
CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng vocabulary (chính)
CREATE TABLE IF NOT EXISTS vocabulary (
    id VARCHAR(36) PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255),
    meaning TEXT NOT NULL,
    topic_id VARCHAR(36),
    synonym TEXT,
    word_family TEXT,
    example TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- Tạo bảng rooms (cho game)
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(6) UNIQUE,
    status ENUM('waiting', 'playing', 'finished'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL
);

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50),
    is_host BOOLEAN NOT NULL DEFAULT FALSE,
    socket_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng room_users
CREATE TABLE IF NOT EXISTS room_users (
    room_id VARCHAR(36),
    user_id VARCHAR(36),
    score INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    PRIMARY KEY (room_id, user_id)
);

-- Tạo bảng game_questions
CREATE TABLE IF NOT EXISTS game_questions (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36),
    vocabulary_id VARCHAR(36),
    asked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id),
    FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id)
);

-- Tạo bảng user_answers
CREATE TABLE IF NOT EXISTS user_answers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    question_id VARCHAR(36),
    answer TEXT,
    is_correct BOOLEAN,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (question_id) REFERENCES game_questions(id)
);

-- Insert topics
INSERT INTO topics (id, name) VALUES
(UUID(), 'Job'),
(UUID(), 'Advertising Marketing Promotion'),
(UUID(), 'Manufacturing'),
(UUID(), 'Shipping'),
(UUID(), 'Technology Internet'),
(UUID(), 'Contract Law'),
(UUID(), 'Shopping'),
(UUID(), 'Travel And Tourism'),
(UUID(), 'Real Estate Banking'),
(UUID(), 'Cuisine Leisure');

-- Import data từ các file JSON
-- (Sẽ được thực hiện bằng Node.js script)
