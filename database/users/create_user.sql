insert into users (
  username,
  mail,
  password_hash,
  password_salt,
  role,
  profile_pic,
  tos_accepted_at
)
values ($1, $2, $3, $4, $5, $6, $7)
returning id, username, role;