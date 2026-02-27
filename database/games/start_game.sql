update games
set status = 'started',
    started_at = now()
where id = $1
returning *;