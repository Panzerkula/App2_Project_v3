CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    profile_pic TEXT DEFAULT '/assets/no_pic.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);