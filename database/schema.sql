-- Wayamba Exchange - Phase 1 database
-- Import this file in phpMyAdmin (Import tab) or run: mysql -u root < database/schema.sql

CREATE DATABASE IF NOT EXISTS wayamba_exchange
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wayamba_exchange;

CREATE TABLE IF NOT EXISTS users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id    VARCHAR(20)  NOT NULL UNIQUE,
    full_name     VARCHAR(100) NOT NULL,
    faculty       ENUM(
        'Faculty of Applied Sciences',
        'Faculty of Business Studies and Finance',
        'Faculty of Technology',
        'Faculty of Medicine',
        'Faculty of Agriculture and Plantation Management',
        'Faculty of Livestock, Fisheries, and Nutrition',
        'Administration'
    ) NOT NULL,
    contact       VARCHAR(15)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('student','admin')    NOT NULL DEFAULT 'student',
    status        ENUM('active','suspended') NOT NULL DEFAULT 'active',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL
) ENGINE=InnoDB;
