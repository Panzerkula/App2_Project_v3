insert into game_players (game_id, user_id, username)
values ($1, $2, $3)
returning *;