create table if not exists games (
  id serial primary key,
  owner_id integer not null references users(id) on delete cascade,
  name text not null default 'Untitled Game',
  status text not null check (status in ('waiting','started','finished')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists game_players (
  id serial primary key,
  game_id integer not null references games(id) on delete cascade,
  user_id integer references users(id) on delete set null,
  username text not null,
  unique(game_id, username)
);

create table if not exists game_scores (
  id serial primary key,
  game_id integer not null references games(id) on delete cascade,
  player_id integer not null references game_players(id) on delete cascade,
  round_number integer not null,
  score integer not null,
  unique(player_id, round_number)
);