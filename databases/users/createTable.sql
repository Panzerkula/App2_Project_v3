CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    profile_pic TEXT DEFAULT '/assets/no_pic.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);