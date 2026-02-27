select *
from game_players
where game_id = $1
and username = $2;