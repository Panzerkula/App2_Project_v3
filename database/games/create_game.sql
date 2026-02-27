insert into games (owner_id, name, status)
values ($1, $2, 'waiting')
returning *;