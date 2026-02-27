select
  g.id as game_id,
  g.name,
  g.status,
  g.owner_id,
  g.created_at,
  g.started_at,
  g.finished_at,
  gp.id as player_id,
  gp.user_id,
  gp.username,
  gs.round_number,
  gs.score
from games g
left join game_players gp on gp.game_id = g.id
left join game_scores gs on gs.player_id = gp.id
where g.id = $1
order by gp.id, gs.round_number;