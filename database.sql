-- Create Database
CREATE DATABASE IF NOT EXISTS focusforge;
USE focusforge;

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATETIME,
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    tags VARCHAR(255),

    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed TINYINT(1) DEFAULT 0,

    completed_at DATETIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);