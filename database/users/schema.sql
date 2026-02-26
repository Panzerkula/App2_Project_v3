create table if not exists users (
  id serial primary key,
  username text not null unique,
  mail text not null unique,
  password_hash text not null,
  password_salt text not null,
  role text not null default 'user',
  profile_pic text not null default '/assets/no_pic.png',
  tos_accepted_at timestamptz not null,
  created_at timestamptz not null default now()
);