INSERT INTO users (username, email, password_hash, profile_pic, created_at)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, username;