update users
set
  username = coalesce($1, username),
  password_hash = coalesce($2, password_hash),
  password_salt = coalesce($3, password_salt),
  profile_pic = coalesce($4, profile_pic)
where id = $5
returning id, username, role;