update games
set status = 'finished',
    finished_at = now()
where id = $1
returning *;