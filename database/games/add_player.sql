insert into game_players (game_id, username)
values ($1, $2)
returning *;