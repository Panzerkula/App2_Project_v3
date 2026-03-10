import express from "express";
import { requireAuth } from "../modules/auth_middleware.mjs";
import { hashPassword, verifyPassword } from "../modules/password.mjs";
import {
  checkLoginRateLimit,
  registerFailedAttempt,
  resetAttempts,
} from "../modules/login_rate_limiter.mjs";
import { requireAdmin } from "../modules/admin_middleware.mjs";
import { pool } from "../modules/db.mjs";
import { loadSql } from "../modules/sql.mjs";
import { getLocale } from "../modules/locale_middleware.mjs"

const router = express.Router();

/* ---------------- SIGNUP ---------------- */

router.post("/signup", async (req, res) => {

  const locale = getLocale(req);
  const { username, password, mail, acceptTos, profilePic } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: locale.MISSING_FIELDS });

  if (!mail || !mail.includes("@"))
    return res.status(400).json({ error: locale.MISSING_MAIL });

  if (acceptTos !== true)
    return res.status(400).json({ error: locale.MISSING_TOS });

  try {
    const checkSql = await loadSql("users", "get_user_by_username.sql");
    const existing = await pool.query(checkSql, [username]);

    if (existing.rows.length > 0)
      return res.status(409).json({ error: locale.USERNAME_TAKEN });

    const { hash, salt } = hashPassword(password);

    const insertSql = await loadSql("users", "create_user.sql");

    await pool.query(insertSql, [
      username,
      mail,
      hash,
      salt,
      username === "admin" ? "admin" : "user",
      profilePic ?? "/assets/no_pic.png",
      new Date().toISOString(),
    ]);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

//---------------Edit user Router------------------------------

router.put("/me", requireAuth, async (req, res) => {

  const locale = getLocale(req);
  const { username, password, profilePic } = req.body;
  const userId = req.session.user.id;

  try {
    const getSql = await loadSql("users", "get_user_by_id.sql");
    const existingUserResult = await pool.query(getSql, [userId]);
    const existingUser = existingUserResult.rows[0];

    if (!existingUser) {
      return res.status(404).json({ error: locale.USER_NOT_FOUND });
    }

    if (username && username !== existingUser.username) {
      const checkSql = await loadSql("users", "get_user_by_username.sql");
      const usernameCheck = await pool.query(checkSql, [username]);

      if (usernameCheck.rows.length > 0) {
        return res.status(409).json({ error: locale.USERNAME_TAKEN });
      }
    }

    let newHash = null;
    let newSalt = null;

    if (password) {
      const result = hashPassword(password);
      newHash = result.hash;
      newSalt = result.salt;
    }

    const updateSql = await loadSql("users", "update_user.sql");

    const updateResult = await pool.query(updateSql, [
      username ?? null,
      newHash,
      newSalt,
      profilePic ?? null,
      userId,
    ]);

    const updatedUser = updateResult.rows[0];

    if (username) {
      req.session.user.username = updatedUser.username;
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

//------------Delete User Router--------------------------------

router.delete("/me", requireAuth, async (req, res) => {
  const locale = getLocale(req);
  try {
    const sql = await loadSql("users", "delete_user.sql");
    await pool.query(sql, [req.session.user.id]);

    req.session.destroy(() => {
      res.json({ success: true });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

//---------------Login Router----------------------------------

router.post("/login", async (req, res) => {
  const locale = getLocale(req);
  const { username, password } = req.body;
  const key = `${req.ip}:${username}`;

  if (!checkLoginRateLimit(key))
    return res.status(429).json({ error: locale.RATE_LIMIT });

  try {
    const sql = await loadSql("users", "get_user_by_username.sql");
    const result = await pool.query(sql, [username]);

    const user = result.rows[0];

    if (!user) {
      registerFailedAttempt(key);
      return res.status(401).json({ error: locale.INVALID_CREDENTIALS });
    }

    const valid = verifyPassword(
      password,
      user.password_salt,
      user.password_hash,
    );

    if (!valid) {
      registerFailedAttempt(key);
      return res.status(401).json({ error: locale.INVALID_CREDENTIALS });
    }

    resetAttempts(key);

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});
//---------------Logout Router------------------------------------------

router.post("/logout", async (req, res) => {
  const locale = getLocale(req);
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

//-------------Current session router-----------------------------------

router.get("/me", requireAuth, async (req, res) => {
  const locale = getLocale(req);
  const sql = await loadSql("users", "get_user_by_id.sql");
  const result = await pool.query(sql, [req.session.user.id]);

  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({ error: locale.USER_NOT_FOUND });
  }

  res.json({
    id: user.id,
    username: user.username,
    mail: user.mail,
    profilePic: user.profilePic,
    createdAt: user.consent?.tosAcceptedAt,
  });
});

//---------------List users router-----------------------------------

router.get("/users", requireAuth, async (req, res) => {
  const locale = getLocale(req);
  try {
    const sql = await loadSql("users", "list_users.sql");
    const result = await pool.query(sql);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

//-----------------Admin router-------------------------------------

router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  const locale = getLocale(req);
  try {
    const sql = await loadSql("users", "list_users.sql");
    const result = await pool.query(sql);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: locale.SERVER_ERROR });
  }
});

export default router;
