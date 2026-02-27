select distinct g.*
from games g
join game_players gp on gp.game_id = g.id
where gp.user_id = $1
order by g.created_at desc;