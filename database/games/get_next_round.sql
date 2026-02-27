select coalesce(max(round_number), 0) + 1 as next_round
from game_scores
where game_id = $1;